import { Request, Response } from "express";
import { Op, literal, fn, col } from "sequelize";
import moment from "moment";
import { maxid, url } from "../utils";
import {
    decodeId,
    extractVideoId,
    fetchFbComments,
    fetchFbLiveInfo,
    liveProductCapacity,
    nextLiveCode,
    normalizeLiveCode,
    parseCfComment,
    toNumber,
    toQuantity,
} from "../utils/liveCf";
import LiveSession from "../models/LiveSession";
import LiveProduct from "../models/LiveProduct";
import LiveComment from "../models/LiveComment";
import LiveOrder from "../models/LiveOrder";
import LiveOrderList from "../models/LiveOrderList";
import Products from "../models/Products";
import Units from "../models/Units.Model";

interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}

// ສະຖານະຄອມເມັນ: 0=ທຳມະດາ, 1=CF ຈັບຄູ່ໄດ້, 2=ບໍ່ພົບລະຫັດ, 3=ເກີນຈຳກັດ, 4=ບັນທຶກອໍເດີແລ້ວ
const CF_MATCHED = 1;
const CF_NOT_FOUND = 2;
const CF_OVER_LIMIT = 3;
const CF_SAVED = 4;

/** ສິນຄ້າຕົ້ນສະບັບ — ຊື່/SKU/ຫົວໜ່ວຍ/ຮູບ/ລາຄາ/ສະຕ໋ອກ ດຶງດ້ວຍ join ບໍ່ໄດ້ເກັບຊ້ຳໄວ້ໃນ tbl_live_product */
const productInclude = {
    model: Products,
    as: "product",
    attributes: ["product_uuid", "productName", "sku", "images", "sellPrices", "quantity", "stock"],
    include: [{ model: Units, as: "unit", attributes: ["unit_uuid", "unitName"] }],
    required: false,
};

/**
 * ຈຳນວນທີ່ຍັງ CF ໄດ້ຂອງສິນຄ້າໄລ໌ 1 ລາຍການ (ໄລຍະອ່ານຄອມເມັນ)
 * ສະຕ໋ອກທີ່ໃຊ້ໄດ້ = ສະຕ໋ອກຈິງ − CF ທີ່ຍັງບໍ່ທັນເປັນອໍເດີ (ອໍເດີແລ້ວຕັດສະຕ໋ອກໄປແລ້ວ)
 */
const capacityOf = (row: any, stockNow: number) =>
    liveProductCapacity(
        toNumber(row.limit_qty),
        toNumber(row.cf_qty),
        toNumber(row.deductStock) === 1,
        stockNow - Math.max(0, toNumber(row.cf_qty) - toNumber(row.sold_qty))
    );

/** ແປງແຖວສິນຄ້າໄລ໌ + ຂໍ້ມູນທີ່ join ມາ ໃຫ້ເປັນຮູບແບບທີ່ໜ້າບ້ານໃຊ້ */
const mapLiveProduct = (row: any) => {
    const values: any = typeof row?.toJSON === "function" ? row.toJSON() : row;
    const product: any = values.product ?? {};
    const stockNow = toNumber(product.quantity);
    const capacity = capacityOf(values, stockNow);

    return {
        ...values,
        productName: product.productName ?? null,
        sku: product.sku ?? null,
        unitName: product.unit?.unitName ?? null,
        image: product.images ? `${url()}/product/${product.images}` : null,
        price: toNumber(product.sellPrices),
        stock_now: stockNow,
        capacity: Number.isFinite(capacity) ? capacity : null,
    };
};

/** ຫາໄລ໌ທີ່ກຳລັງໃຊ້ຢູ່ ຈາກ liveid ຫຼື (shopid + videoid) — ສ້າງໃໝ່ໃຫ້ຖ້າຍັງບໍ່ມີ */
const resolveSession = async (body: any, createIfMissing = false) => {
    const liveid = body?.liveid ?? body?.live_uuid;
    if (liveid) {
        return await LiveSession.findByPk(decodeId(String(liveid)));
    }

    const shopid = toNumber(body?.shopid);
    const videoid = extractVideoId(body?.videoid ?? body?.videoId ?? body?.videoUrl);
    if (!shopid || !videoid) return null;

    const live = await LiveSession.findOne({
        where: { shopid, videoid },
        order: [["live_uuid", "DESC"]],
    });
    if (live) return live;
    if (!createIfMissing) return null;

    const live_uuid = await maxid(LiveSession, "live_uuid");
    return await LiveSession.create({
        live_uuid,
        shopid,
        title: `Live ${moment().format("DD/MM/YYYY HH:mm")}`,
        platform: "facebook",
        videoid,
        videoUrl: body?.videoUrl ?? null,
        accessToken: body?.accessToken ?? null,
        status: 1,
        startedAt: new Date(),
        createby: body?.createby ?? null,
    });
};

/** ເລກໃບຈອງຕໍ່ໄປ ເຊັ່ນ LV250818-1 */
const nextOrderNo = async (prefix: string) => {
    const lastRow = await LiveOrder.findOne({
        where: { orderNo: { [Op.like]: `${prefix}%` } },
        order: [["orderNo", "DESC"]],
    });
    const lastNo = lastRow ? String(lastRow.get("orderNo")) : "";
    const suffix = lastNo ? parseInt(lastNo.replace(prefix, ""), 10) || 0 : 0;
    return suffix + 1;
};

// ==================== ໄລ໌ສົດ (session) ====================

// ເປີດໄລ໌ໃໝ່
export const createLiveSession = async (req: Request, res: Response) => {
    try {
        const { shopid, videoUrl, accessToken, title, pageid, platform, createby } = req.body as any;
        const videoid = extractVideoId(req.body.videoid ?? req.body.videoId ?? videoUrl);

        if (!shopid) return res.status(400).json({ error: "shopid is required" });
        if (!videoid) return res.status(400).json({ error: "videoid is required" });

        const existing = await LiveSession.findOne({ where: { shopid, videoid, status: 1 } });
        if (existing) {
            await existing.update({
                accessToken: accessToken || existing.accessToken,
                videoUrl: videoUrl || existing.videoUrl,
            });
            return res.status(200).json({ message: "Live session already running", data: existing });
        }

        const live_uuid = await maxid(LiveSession, "live_uuid");
        const live = await LiveSession.create({
            live_uuid,
            shopid,
            title: title || `Live ${moment().format("DD/MM/YYYY HH:mm")}`,
            platform: platform || "facebook",
            videoid,
            videoUrl: videoUrl || null,
            pageid: pageid || null,
            accessToken: accessToken || null,
            status: 1,
            startedAt: new Date(),
            createby: createby || null,
        });

        res.status(200).json({ message: "Live session created successfully", data: live });
    } catch (error) {
        res.status(500).json({ error: "Failed to create live session" });
    }
};

// ລາຍການໄລ໌ທັງໝົດ (ປະຫວັດ)
export const getLiveSession = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
        const offset = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "live_uuid";
        const order = (req.query.order || "DESC").toUpperCase() as "ASC" | "DESC";
        const { shopid, status, startDate, endDate } = req.body as any;

        const whereConditions: any = {};
        if (shopid) whereConditions.shopid = shopid;
        if (status) whereConditions.status = status;
        if (startDate && endDate) {
            whereConditions.startedAt = {
                [Op.between]: [
                    moment(startDate).startOf("day").toDate(),
                    moment(endDate).endOf("day").toDate(),
                ],
            };
        }

        const { rows, count } = await LiveSession.findAndCountAll({
            where: whereConditions,
            attributes: { exclude: ["accessToken"] },
            limit,
            offset,
            order: [[orderBy, order]],
        });

        res.status(200).json({ data: rows, total: count, limit, offset });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch live session" });
    }
};

// ໄລ໌ 1 ລາຍການ ພ້ອມສິນຄ້າທີ່ໄລ໌
export const getLiveById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const liveid = decodeId(req.params.id);
        const live = await LiveSession.findByPk(liveid, {
            attributes: { exclude: ["accessToken"] },
            include: [
                {
                    model: LiveProduct,
                    as: "liveProducts",
                    where: { status: { [Op.ne]: 9 } },
                    required: false,
                    include: [productInclude],
                },
            ],
            order: [[{ model: LiveProduct, as: "liveProducts" }, "code", "ASC"]],
        });

        if (!live) return res.status(404).json({ error: "Live session not found" });

        const data: any = live.toJSON();
        data.liveProducts = (data.liveProducts ?? []).map(mapLiveProduct);
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch live session" });
    }
};

// ປິດໄລ໌ + ສະຫຼຸບຍອດ
export const closeLiveSession = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const liveid = decodeId(req.params.id);
        const live = await LiveSession.findByPk(liveid);
        if (!live) return res.status(404).json({ error: "Live session not found" });

        const products = await LiveProduct.findAll({ where: { liveid } });

        // ບັນທຶກສະຕ໋ອກຕອນປິດໄລ໌ ໄວ້ກວດຄວາມຖືກຕ້ອງພາຍຫຼັງ
        for (const row of products) {
            const product = await Products.findByPk(toNumber(row.productid));
            await row.update({
                stock_end: product ? toNumber(product.quantity) : null,
                status: toNumber(row.status) === 9 ? 9 : 2,
            });
        }

        const totals: any = await LiveOrderList.findOne({
            where: { liveid, status: 1 },
            attributes: [
                [fn("SUM", col("quantity")), "qty"],
                [fn("SUM", col("balance_total")), "amount"],
            ],
            raw: true,
        });
        const orderCount = await LiveOrder.count({ where: { liveid, status: { [Op.ne]: 9 } } });

        await live.update({
            status: 2,
            endedAt: new Date(),
            total_products: products.filter((row) => toNumber(row.status) !== 9).length,
            total_orders: orderCount,
            total_qty: toNumber(totals?.qty),
            total_amount: toNumber(totals?.amount),
        });

        res.status(200).json({ message: "Live session closed successfully", data: live });
    } catch (error) {
        res.status(500).json({ error: "Failed to close live session" });
    }
};

// ==================== ສິນຄ້າທີ່ໄລ໌ ====================

// ເພີ່ມສິນຄ້າເຂົ້າໄລ໌ (ເກັບຂໍ້ມູນສຳເນົາ + ຕັ້ງລະຫັດ CF)
export const createLiveProduct = async (req: Request, res: Response) => {
    try {
        const live = await resolveSession(req.body);
        if (!live) return res.status(404).json({ error: "Live session not found" });

        const liveid = toNumber(live.live_uuid);
        const productid = toNumber(req.body.productid);
        if (!productid) return res.status(400).json({ error: "productid is required" });

        const exists = await LiveProduct.findOne({
            where: { liveid, productid, status: { [Op.ne]: 9 } },
        });
        if (exists) {
            return res.status(409).json({ error: "ສິນຄ້ານີ້ຢູ່ໃນລາຍການໄລ໌ແລ້ວ", data: exists });
        }

        const product = await Products.findByPk(productid);
        if (!product) return res.status(404).json({ error: "Product not found" });

        const rows = await LiveProduct.findAll({
            where: { liveid, status: { [Op.ne]: 9 } },
            attributes: ["code"],
        });
        const usedCodes = rows.map((row) => String(row.code ?? ""));
        const code = normalizeLiveCode(req.body.code) || nextLiveCode(usedCodes);

        if (usedCodes.includes(code)) {
            return res.status(409).json({ error: `ລະຫັດ ${code} ຖືກໃຊ້ແລ້ວໃນໄລ໌ນີ້` });
        }

        const _uuid = await maxid(LiveProduct, "_uuid");
        await LiveProduct.create({
            _uuid,
            liveid,
            shopid: toNumber(req.body.shopid ?? live.shopid),
            productid,
            code,
            // ຄ່າເລີ່ມຕົ້ນ: ຕັດສະຕ໋ອກຕາມການຕັ້ງຄ່າຂອງສິນຄ້າ (tbl_products.stock = 1)
            deductStock:
                req.body.deductStock !== undefined
                    ? Number(!!req.body.deductStock)
                    : Number(toNumber(product.stock) === 1),
            limit_qty: Math.max(0, toNumber(req.body.limit_qty ?? req.body.limit)),
            sort: toNumber(req.body.sort),
            status: 1,
        });

        const totalProducts = await LiveProduct.count({
            where: { liveid, status: { [Op.ne]: 9 } },
        });
        await live.update({ total_products: totalProducts });

        const created = await LiveProduct.findByPk(_uuid, { include: [productInclude] });
        res.status(200).json({
            message: "Live product created successfully",
            data: created ? mapLiveProduct(created) : null,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to create live product" });
    }
};

// ລາຍການສິນຄ້າໃນໄລ໌
export const getLiveProduct = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const liveid = decodeId(req.params.id);
        const rows = await LiveProduct.findAll({
            where: { liveid, status: { [Op.ne]: 9 } },
            include: [productInclude],
            order: [["code", "ASC"]],
        });

        // ແນບຂໍ້ມູນສິນຄ້າ ແລະ ຈຳນວນທີ່ຍັງ CF ໄດ້ ໄປນຳ ເພື່ອໃຫ້ໜ້າບ້ານໃຊ້ໄດ້ເລີຍ
        res.status(200).json({ data: rows.map(mapLiveProduct) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch live product" });
    }
};

// ແກ້ລະຫັດ CF / ຈຳກັດຈຳນວນ / ຕັດສະຕ໋ອກ
export const updateLiveProduct = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const _uuid = decodeId(req.params.id);
        const liveProduct = await LiveProduct.findByPk(_uuid);
        if (!liveProduct) return res.status(404).json({ error: "Live product not found" });

        const values: any = {};

        if (req.body.code !== undefined) {
            const code = normalizeLiveCode(req.body.code);
            if (!code) return res.status(400).json({ error: "ລະຫັດ CF ບໍ່ຖືກຕ້ອງ" });

            const duplicate = await LiveProduct.findOne({
                where: {
                    liveid: liveProduct.liveid,
                    code,
                    _uuid: { [Op.ne]: liveProduct._uuid },
                    status: { [Op.ne]: 9 },
                },
            });
            if (duplicate) return res.status(409).json({ error: `ລະຫັດ ${code} ຖືກໃຊ້ແລ້ວ` });
            values.code = code;
        }

        if (req.body.deductStock !== undefined) values.deductStock = Number(!!req.body.deductStock);
        if (req.body.limit_qty !== undefined || req.body.limit !== undefined) {
            values.limit_qty = Math.max(0, toNumber(req.body.limit_qty ?? req.body.limit));
        }
        if (req.body.sort !== undefined) values.sort = toNumber(req.body.sort);
        if (req.body.status !== undefined) values.status = toNumber(req.body.status, 1);
        values.updatedAt = new Date();

        await liveProduct.update(values);

        const updated = await LiveProduct.findByPk(liveProduct._uuid, {
            include: [productInclude],
        });
        res.status(200).json({
            message: "Live product updated successfully",
            data: updated ? mapLiveProduct(updated) : null,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update live product" });
    }
};

// ເອົາສິນຄ້າອອກຈາກໄລ໌ (ຖ້າມີອໍເດີແລ້ວຈະບໍ່ລຶບຖິ້ມ ແຕ່ຕັ້ງ status=9 ໄວ້ເປັນປະຫວັດ)
export const deleteLiveProduct = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const _uuid = decodeId(req.params.id);
        const liveProduct = await LiveProduct.findByPk(_uuid);
        if (!liveProduct) return res.status(404).json({ error: "Live product not found" });

        const used = await LiveOrderList.count({ where: { liveproductid: liveProduct._uuid } });
        if (used > 0) {
            await liveProduct.update({ status: 9, updatedAt: new Date() });
        } else {
            await liveProduct.destroy();
        }

        const live = await LiveSession.findByPk(toNumber(liveProduct.liveid));
        if (live) {
            const total = await LiveProduct.count({
                where: { liveid: liveProduct.liveid, status: { [Op.ne]: 9 } },
            });
            await live.update({ total_products: total });
        }

        res.status(200).json({ message: "Live product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete live product" });
    }
};

// ==================== ຄອມເມັນສົດ ====================

/**
 * ດຶງຄອມເມັນຈາກ Facebook → ບັນທຶກລົງ tbl_live_comment (ບໍ່ຊ້ຳ)
 * → ອ່ານ CF → ຈັບຄູ່ລະຫັດ → ກວດຈຳກັດຈຳນວນ/ສະຕ໋ອກ → ອັບເດດຕົວນັບ
 */
export const fetchLiveComments = async (req: Request, res: Response) => {
    try {
        const live = await resolveSession(req.body, true);
        if (!live) return res.status(400).json({ error: "shopid ແລະ videoid ຕ້ອງມີ" });

        const liveid = toNumber(live.live_uuid);
        const videoid = String(live.videoid ?? "");
        const accessToken = String(req.body.accessToken || live.accessToken || "");
        if (!accessToken) return res.status(400).json({ error: "ບໍ່ພົບ Page Access Token" });

        if (req.body.accessToken && req.body.accessToken !== live.accessToken) {
            await live.update({ accessToken: req.body.accessToken });
        }

        let rows: any[] = [];
        try {
            rows = await fetchFbComments(videoid, accessToken, toNumber(req.body.limit, 100) || 100);
        } catch (error: any) {
            return res.status(502).json({ error: error?.message || "ດຶງຄອມເມັນຈາກ Facebook ບໍ່ໄດ້" });
        }

        const info = await fetchFbLiveInfo(videoid, accessToken);

        // ສິນຄ້າໃນໄລ໌ ຈັດເປັນ map ຕາມລະຫັດ CF
        const liveProducts = await LiveProduct.findAll({
            where: { liveid, status: { [Op.ne]: 9 } },
            include: [productInclude],
        });
        const productByCode = new Map<string, any>();
        liveProducts.forEach((row) => productByCode.set(String(row.code ?? ""), row));

        const existing = await LiveComment.findAll({
            where: { liveid, commentid: { [Op.in]: rows.map((row) => String(row?.id ?? "")) } },
            attributes: ["commentid"],
        });
        const seen = new Set(existing.map((row) => String(row.commentid)));

        let freshCount = 0;
        let freshCf = 0;

        for (const row of rows) {
            const commentid = String(row?.id ?? "");
            if (!commentid || seen.has(commentid)) continue;
            seen.add(commentid);

            const message = String(row?.message ?? "");
            const parsed = parseCfComment(message);
            const code = parsed ? normalizeLiveCode(parsed.code) : null;
            const quantity = parsed ? toQuantity(parsed.quantity) : 0;

            let status = 0;
            let liveproductid: number | null = null;

            if (parsed) {
                const product = code ? productByCode.get(code) : null;
                if (!product) {
                    status = CF_NOT_FOUND;
                } else {
                    liveproductid = toNumber(product._uuid);
                    const capacity = capacityOf(
                        product.toJSON(),
                        toNumber(product.get("product")?.quantity)
                    );

                    if (quantity > capacity) {
                        status = CF_OVER_LIMIT;
                        await product.update({
                            reject_qty: toNumber(product.reject_qty) + quantity,
                            updatedAt: new Date(),
                        });
                    } else {
                        status = CF_MATCHED;
                        await product.update({
                            cf_count: toNumber(product.cf_count) + 1,
                            cf_qty: toNumber(product.cf_qty) + quantity,
                            // ຮັບຄົບແລ້ວ → ປິດການຮັບ CF ຂອງລາຍການນີ້
                            status: capacity - quantity <= 0 ? 2 : 1,
                            updatedAt: new Date(),
                        });
                    }
                }
                freshCf += 1;
            }

            const _uuid = await maxid(LiveComment, "_uuid");
            await LiveComment.create({
                _uuid,
                liveid,
                commentid,
                fb_userid: String(row?.from?.id ?? ""),
                customerName: row?.from?.name ?? "ບໍ່ລະບຸຊື່",
                picture: row?.from?.picture?.data?.url ?? null,
                message,
                is_cf: parsed ? 1 : 0,
                code,
                quantity,
                liveproductid,
                status,
                commentAt: row?.created_time ? new Date(row.created_time) : new Date(),
            });
            freshCount += 1;
        }

        if (freshCount || info.live_views) {
            await live.update({
                total_comments: toNumber(live.total_comments) + freshCount,
                total_cf: toNumber(live.total_cf) + freshCf,
                viewers_last: info.live_views,
                viewers_peak: Math.max(toNumber(live.viewers_peak), info.live_views),
                updatedAt: new Date(),
            });
        }

        // ສົ່ງຄືນຄອມເມັນລ່າສຸດ (ຮູບແບບດຽວກັບທີ່ໜ້າບ້ານໃຊ້ຢູ່)
        const saved = await LiveComment.findAll({
            where: { liveid },
            order: [["commentAt", "DESC"]],
            limit: 100,
        });

        const data = saved
            .map((row) => {
                const values: any = row.toJSON();
                return {
                    id: values.commentid,
                    fromId: values.fb_userid,
                    fromName: values.customerName,
                    picture: values.picture,
                    message: values.message,
                    createdAt: values.commentAt,
                    is_cf: values.is_cf,
                    code: values.code,
                    quantity: values.quantity,
                    liveproductid: values.liveproductid,
                    status: values.status,
                };
            })
            .reverse();

        res.status(200).json({
            data,
            live: { live_views: info.live_views, status: info.status },
            viewers: info.live_views,
            liveid,
            fresh: freshCount,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch live comments" });
    }
};

// ==================== ອໍເດີ CF ====================

/**
 * ບັນທຶກອໍເດີ CF (ຈັດກຸ່ມຕາມລູກຄ້າ 1 ຄົນ = 1 ໃບຈອງ)
 * - ກວດຈຳກັດຈຳນວນ ແລະ ສະຕ໋ອກ ອີກຮອບຢູ່ຫຼັງບ້ານ
 * - ຕັດສະຕ໋ອກເມື່ອສິນຄ້າໄລ໌ຕັ້ງ deductStock=1 ແລະ ສິນຄ້າຕົ້ນສະບັບເປີດການຕັດສະຕ໋ອກ
 */
export const createLiveOrder = async (req: Request, res: Response) => {
    const { orders } = req.body as any;
    if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({ error: "orders is required" });
    }

    const live = await resolveSession(req.body, true);
    if (!live) return res.status(400).json({ error: "shopid ແລະ videoid ຕ້ອງມີ" });

    const liveid = toNumber(live.live_uuid);
    const shopid = toNumber(req.body.shopid ?? live.shopid);
    const t = await LiveOrder.sequelize?.transaction();

    try {
        // ຈັດກຸ່ມຕາມລູກຄ້າ
        const groups = new Map<string, any[]>();
        orders.forEach((item: any) => {
            const key = String(item.customerid ?? item.fb_userid ?? item.customer ?? "guest");
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        });

        const prefix = `LV${moment().format("YYMMDD")}-`;
        let running = await nextOrderNo(prefix);

        const created: any[] = [];
        const rejected: any[] = [];
        let liveQty = 0;
        let liveAmount = 0;

        for (const [, items] of groups) {
            const lines: any[] = [];
            let totalQty = 0;
            let totalAmount = 0;

            for (const item of items) {
                const code = normalizeLiveCode(item.code);
                const quantity = toQuantity(item.quantity);

                const liveProduct = await LiveProduct.findOne({
                    where: item.liveproductid
                        ? { _uuid: toNumber(item.liveproductid) }
                        : code
                            ? { liveid, code, status: { [Op.ne]: 9 } }
                            : { liveid, productid: toNumber(item.productid), status: { [Op.ne]: 9 } },
                    transaction: t,
                });

                if (!liveProduct) {
                    rejected.push({ ...item, reason: "ບໍ່ພົບສິນຄ້ານີ້ໃນລາຍການໄລ໌" });
                    continue;
                }

                // ກັນບັນທຶກຄອມເມັນດຽວກັນຊ້ຳ
                if (item.commentid) {
                    const duplicate = await LiveOrderList.findOne({
                        where: { liveid, commentid: String(item.commentid), code: liveProduct.code },
                        transaction: t,
                    });
                    if (duplicate) {
                        rejected.push({ ...item, reason: "ບັນທຶກຄອມເມັນນີ້ໄປແລ້ວ" });
                        continue;
                    }
                }

                const product = await Products.findByPk(toNumber(liveProduct.productid), {
                    transaction: t,
                });
                const stockLeft = product ? toNumber(product.quantity) : 0;
                const deductStock = toNumber(liveProduct.deductStock) === 1;

                // ຈຳນວນທີ່ຍັງຮັບໄດ້ = ຈຳກັດ − ທີ່ຂາຍໄປແລ້ວ ແລະ ບໍ່ເກີນສະຕ໋ອກຈິງ
                const capacity = liveProductCapacity(
                    toNumber(liveProduct.limit_qty),
                    toNumber(liveProduct.sold_qty),
                    deductStock,
                    stockLeft
                );

                if (quantity > capacity) {
                    rejected.push({
                        ...item,
                        reason:
                            toNumber(liveProduct.limit_qty) > 0
                                ? "ເກີນຈຳນວນທີ່ຈຳກັດ"
                                : "ສະຕ໋ອກບໍ່ພໍ",
                    });
                    await liveProduct.update(
                        { reject_qty: toNumber(liveProduct.reject_qty) + quantity },
                        { transaction: t }
                    );
                    continue;
                }

                // ລາຄາ: ໃຊ້ຄ່າທີ່ສົ່ງມາ ຫຼື ລາຄາຂາຍຂອງສິນຄ້າຕົ້ນສະບັບ
                const price = toNumber(item.price ?? product?.sellPrices);
                const balance = price * quantity;

                lines.push({
                    liveProduct,
                    product,
                    code: liveProduct.code,
                    productName: product?.productName ?? null,
                    productid: toNumber(liveProduct.productid),
                    quantity,
                    price,
                    balance,
                    commentid: item.commentid ? String(item.commentid) : null,
                    deductStock,
                });

                totalQty += quantity;
                totalAmount += balance;
            }

            if (!lines.length) continue;

            const first = items[0] ?? {};
            const order_uuid = await maxid(LiveOrder, "order_uuid", { transaction: t });
            const order = await LiveOrder.create(
                {
                    order_uuid,
                    liveid,
                    shopid,
                    orderNo: `${prefix}${running}`,
                    customerid: first.customer_uuid ? toNumber(first.customer_uuid) : null,
                    fb_userid: String(first.customerid ?? first.fb_userid ?? ""),
                    customerName: first.customer ?? first.customerName ?? "ບໍ່ລະບຸຊື່",
                    phone: first.phone ?? null,
                    address: first.address ?? null,
                    total_qty: totalQty,
                    total_amount: totalAmount,
                    discount: 0,
                    shipping_fee: 0,
                    balance_total: totalAmount,
                    status: 1,
                    createby: req.body.createby ?? null,
                },
                { transaction: t }
            );
            running += 1;

            for (const line of lines) {
                const list_uuid = await maxid(LiveOrderList, "_uuid", { transaction: t });
                const stockMoved =
                    line.deductStock && line.product && toNumber(line.product.stock) === 1;
                await LiveOrderList.create(
                    {
                        _uuid: list_uuid,
                        orderid: order_uuid,
                        liveid,
                        liveproductid: toNumber(line.liveProduct._uuid),
                        productid: line.productid,
                        code: line.code,
                        productName: line.productName,
                        quantity: line.quantity,
                        price: line.price,
                        balance_total: line.balance,
                        commentid: line.commentid,
                        deductStock: line.deductStock ? 1 : 0,
                        stock_moved: stockMoved ? 1 : 0,
                        status: 1,
                    },
                    { transaction: t }
                );

                // ຕັດສະຕ໋ອກຈາກສິນຄ້າຕົ້ນສະບັບ
                if (stockMoved) {
                    await Products.update(
                        { quantity: literal(`quantity - ${line.quantity}`) },
                        { where: { product_uuid: line.productid }, transaction: t }
                    );
                }

                // ອັບເດດຕົວນັບຂອງສິນຄ້າໄລ໌
                const soldQty = toNumber(line.liveProduct.sold_qty) + line.quantity;
                const soldAmount = toNumber(line.liveProduct.sold_amount) + line.balance;
                await line.liveProduct.update(
                    {
                        sold_qty: soldQty,
                        sold_amount: soldAmount,
                        // ຖ້າອໍເດີເຂົ້າມາໂດຍບໍ່ຜ່ານຄອມເມັນ ໃຫ້ຍົກ cf_qty ຕາມນຳ
                        cf_qty: Math.max(toNumber(line.liveProduct.cf_qty), soldQty),
                        updatedAt: new Date(),
                    },
                    { transaction: t }
                );

                // ໝາຍຄອມເມັນວ່າບັນທຶກແລ້ວ
                if (line.commentid) {
                    await LiveComment.update(
                        { status: CF_SAVED, updatedAt: new Date() },
                        { where: { liveid, commentid: line.commentid }, transaction: t }
                    );
                }
            }

            liveQty += totalQty;
            liveAmount += totalAmount;
            created.push({ ...order.toJSON(), orderList: lines.length });
        }

        if (!created.length) {
            await t?.rollback();
            return res.status(400).json({ error: "ບໍ່ມີອໍເດີທີ່ບັນທຶກໄດ້", rejected });
        }

        await live.update(
            {
                total_orders: toNumber(live.total_orders) + created.length,
                total_qty: toNumber(live.total_qty) + liveQty,
                total_amount: toNumber(live.total_amount) + liveAmount,
                updatedAt: new Date(),
            },
            { transaction: t }
        );

        await t?.commit();
        res.status(200).json({
            message: `ບັນທຶກ ${created.length} ໃບຈອງສຳເລັດ`,
            data: created,
            rejected,
        });
    } catch (error) {
        await t?.rollback();
        res.status(500).json({ error: "Failed to create live order" });
    }
};

// ລາຍການອໍເດີໃນໄລ໌
export const getLiveOrder = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const liveid = decodeId(req.params.id);
        const rows = await LiveOrder.findAll({
            where: { liveid, status: { [Op.ne]: 9 } },
            include: [{ model: LiveOrderList, as: "orderList" }],
            order: [["order_uuid", "DESC"]],
        });

        res.status(200).json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch live order" });
    }
};

// ຍົກເລີກໃບຈອງ (ຄືນສະຕ໋ອກ ແລະ ຕົວນັບ)
export const cancelLiveOrder = async (req: Request<{ id: string }>, res: Response) => {
    const t = await LiveOrder.sequelize?.transaction();
    try {
        const order_uuid = decodeId(req.params.id);
        const order = await LiveOrder.findByPk(order_uuid, { transaction: t });
        if (!order) {
            await t?.rollback();
            return res.status(404).json({ error: "Live order not found" });
        }
        if (toNumber(order.status) === 9) {
            await t?.rollback();
            return res.status(409).json({ error: "ໃບຈອງນີ້ຖືກຍົກເລີກໄປແລ້ວ" });
        }

        const lines = await LiveOrderList.findAll({
            where: { orderid: order.order_uuid, status: 1 },
            transaction: t,
        });

        for (const line of lines) {
            if (toNumber(line.stock_moved) === 1) {
                await Products.update(
                    { quantity: literal(`quantity + ${toNumber(line.quantity)}`) },
                    { where: { product_uuid: toNumber(line.productid) }, transaction: t }
                );
            }

            const liveProduct = await LiveProduct.findByPk(toNumber(line.liveproductid), {
                transaction: t,
            });
            if (liveProduct) {
                await liveProduct.update(
                    {
                        sold_qty: Math.max(0, toNumber(liveProduct.sold_qty) - toNumber(line.quantity)),
                        sold_amount: Math.max(
                            0,
                            toNumber(liveProduct.sold_amount) - toNumber(line.balance_total)
                        ),
                        cf_qty: Math.max(0, toNumber(liveProduct.cf_qty) - toNumber(line.quantity)),
                        status: 1,
                    },
                    { transaction: t }
                );
            }

            await line.update({ status: 9, stock_moved: 0 }, { transaction: t });
        }

        await order.update({ status: 9, updatedAt: new Date() }, { transaction: t });

        const live = await LiveSession.findByPk(toNumber(order.liveid), { transaction: t });
        if (live) {
            await live.update(
                {
                    total_orders: Math.max(0, toNumber(live.total_orders) - 1),
                    total_qty: Math.max(0, toNumber(live.total_qty) - toNumber(order.total_qty)),
                    total_amount: Math.max(
                        0,
                        toNumber(live.total_amount) - toNumber(order.total_amount)
                    ),
                },
                { transaction: t }
            );
        }

        await t?.commit();
        res.status(200).json({ message: "Live order canceled successfully", data: order });
    } catch (error) {
        await t?.rollback();
        res.status(500).json({ error: "Failed to cancel live order" });
    }
};

// ==================== ລາຍງານ ====================

// ສະຫຼຸບຕໍ່ໄລ໌: ເພີ່ມສິນຄ້າຈັກລາຍການ, CF ຈັກຊິ້ນ, ຂາຍໄດ້ເທົ່າໃດ
export const getLiveReport = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const liveid = decodeId(req.params.id);
        const live = await LiveSession.findByPk(liveid, {
            attributes: { exclude: ["accessToken"] },
        });
        if (!live) return res.status(404).json({ error: "Live session not found" });

        const products = await LiveProduct.findAll({
            where: { liveid, status: { [Op.ne]: 9 } },
            include: [productInclude],
            order: [["sold_qty", "DESC"]],
        });

        const summary = products.reduce(
            (total, row) => ({
                products: total.products + 1,
                cf_count: total.cf_count + toNumber(row.cf_count),
                cf_qty: total.cf_qty + toNumber(row.cf_qty),
                reject_qty: total.reject_qty + toNumber(row.reject_qty),
                sold_qty: total.sold_qty + toNumber(row.sold_qty),
                sold_amount: total.sold_amount + toNumber(row.sold_amount),
            }),
            { products: 0, cf_count: 0, cf_qty: 0, reject_qty: 0, sold_qty: 0, sold_amount: 0 }
        );

        const orders = await LiveOrder.count({ where: { liveid, status: { [Op.ne]: 9 } } });
        const comments = await LiveComment.count({ where: { liveid } });
        const cfComments = await LiveComment.count({ where: { liveid, is_cf: 1 } });

        res.status(200).json({
            data: {
                live,
                summary: { ...summary, orders, comments, cfComments },
                products: products.map(mapLiveProduct),
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch live report" });
    }
};
