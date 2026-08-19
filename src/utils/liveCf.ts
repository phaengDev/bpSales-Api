/**
 * ເຄື່ອງມືສຳລັບໄລ໌ສົດ CF (Facebook Live)
 * - ອ່ານຄອມເມັນຫາການສັ່ງຊື້ແບບ CF
 * - ດຶງຄອມເມັນ / ຂໍ້ມູນໄລ໌ ຈາກ Facebook Graph API
 */

export const FB_GRAPH_VERSION = process.env.FB_GRAPH_VERSION || "v21.0";

/** ດຶງລະຫັດວີດີໂອຈາກລິ້ງ Facebook Live (ຮອງຮັບ /videos/123, ?v=123, /live/123 ຫຼື ໃສ່ເລກໂດຍກົງ) */
export const extractVideoId = (input: string): string => {
    const raw = String(input || "").trim();
    if (!raw) return "";
    if (/^\d{6,}$/.test(raw)) return raw;

    return (
        raw.match(/[?&]v=(\d+)/)?.[1] ||
        raw.match(/\/videos\/(?:[^/]+\/)?(\d+)/)?.[1] ||
        raw.match(/\/live[_a-z]*\/(\d+)/)?.[1] ||
        ""
    );
};

/** ຈັດຮູບແບບລະຫັດ CF: ຕົວພິມໃຫຍ່ ບໍ່ມີຍະຫວ່າງ ບໍ່ເກີນ 6 ຕົວ */
export const normalizeLiveCode = (code: string): string =>
    String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

/**
 * ອ່ານຄອມເມັນຫາການສັ່ງຊື້ແບບ CF
 * ຮັບໄດ້: "A1 CF", "cf A1", "A1 CF 2", "CF A1 x2", "5 cf *3"
 * ຄືນ null ຖ້າຄອມເມັນນັ້ນບໍ່ແມ່ນການສັ່ງຊື້
 */
export const parseCfComment = (
    message: string
): { code: string; quantity: number } | null => {
    const text = String(message || "").toUpperCase().replace(/\s+/g, " ").trim();
    if (!/\bCF\b/.test(text)) return null;

    const rest = text.replace(/\bCF\b/g, " ");

    // ຈຳນວນທີ່ຂຽນແບບ x2 / X 2 / *2
    const qtyMatch = rest.match(/[X*]\s*(\d{1,3})\b/);
    const source = qtyMatch ? rest.replace(qtyMatch[0], " ") : rest;

    // ລະຫັດສິນຄ້າ: A1 / AB12 / 5
    const codeMatch = source.match(/\b([A-Z]{1,3}\s?\d{1,4}|\d{1,4})\b/);
    if (!codeMatch) return null;

    let quantity = qtyMatch ? Number(qtyMatch[1]) : 1;
    if (!qtyMatch) {
        // ຮູບແບບ "A1 CF 2" — ຕົວເລກທີ່ຕາມຫຼັງລະຫັດຄືຈຳນວນ
        const after = source.slice((codeMatch.index ?? 0) + codeMatch[0].length);
        const trailing = after.match(/\b(\d{1,3})\b/);
        if (trailing) quantity = Number(trailing[1]);
    }

    return {
        code: codeMatch[1].replace(/\s/g, ""),
        quantity: quantity > 0 ? quantity : 1,
    };
};

/** ຫາລະຫັດຫວ່າງຕໍ່ໄປ: A1 → A2 ... A99 → B1 */
export const nextLiveCode = (usedCodes: string[]): string => {
    const used = new Set(usedCodes.map((code) => normalizeLiveCode(code)));

    for (let letter = 0; letter < 26; letter += 1) {
        for (let number = 1; number <= 99; number += 1) {
            const code = `${String.fromCharCode(65 + letter)}${number}`;
            if (!used.has(code)) return code;
        }
    }
    return "";
};

/**
 * ຈຳນວນທີ່ຍັງ CF ໄດ້ອີກຂອງສິນຄ້າໜຶ່ງລາຍການ
 * - ຖ້າຕັ້ງ limit_qty ໄວ້ → ນັບຈາກ limit_qty ລົບຈຳນວນທີ່ໃຊ້ໄປແລ້ວ
 * - ຖ້າເປີດ deductStock → CF ໄດ້ບໍ່ເກີນສະຕ໋ອກທີ່ຄົງເຫຼືອ
 * - ບໍ່ຕັ້ງທັງສອງ = ບໍ່ຈຳກັດ (Infinity)
 */
export const liveProductCapacity = (
    limitQty: number,
    usedQty: number,
    deductStock: boolean,
    stockLeft: number
): number => {
    const byLimit = limitQty > 0 ? Math.max(0, limitQty - usedQty) : Infinity;
    const byStock = deductStock ? Math.max(0, stockLeft) : Infinity;
    return Math.min(byLimit, byStock);
};

/** ຮັບ id ທີ່ຖືກເຂົ້າລະຫັດ base64 ຈາກໜ້າບ້ານ ຫຼື ຕົວເລກທຳມະດາກໍ່ໄດ້ */
export const decodeId = (value: string): string => {
    const raw = String(value || "").trim();
    if (/^\d+$/.test(raw)) return raw;
    try {
        const decoded = Buffer.from(raw, "base64").toString("utf8");
        return /^\d+$/.test(decoded) ? decoded : raw;
    } catch {
        return raw;
    }
};

export const toNumber = (value: unknown, defaultValue = 0): number => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : defaultValue;
};

export const toQuantity = (value: unknown, defaultValue = 1): number =>
    Math.max(Math.trunc(toNumber(value, defaultValue)), 1);

/** ດຶງຄອມເມັນຈາກ Facebook Graph API */
export const fetchFbComments = async (
    videoid: string,
    accessToken: string,
    limit = 100
): Promise<any[]> => {
    const fields = "id,message,created_time,from{id,name,picture}";
    const endpoint =
        `https://graph.facebook.com/${FB_GRAPH_VERSION}/${videoid}/comments` +
        `?fields=${encodeURIComponent(fields)}` +
        `&order=chronological&limit=${limit}` +
        `&access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(endpoint);
    const result: any = await response.json();

    if (!response.ok) {
        throw new Error(result?.error?.message || "ດຶງຄອມເມັນຈາກ Facebook ບໍ່ໄດ້");
    }
    return Array.isArray(result?.data) ? result.data : [];
};

/** ດຶງຂໍ້ມູນໄລ໌ (ຈຳນວນຜູ້ຊົມ, ສະຖານະ) ຈາກ Facebook Graph API */
export const fetchFbLiveInfo = async (
    videoid: string,
    accessToken: string
): Promise<{ live_views: number; status: string | null }> => {
    try {
        const endpoint =
            `https://graph.facebook.com/${FB_GRAPH_VERSION}/${videoid}` +
            `?fields=live_views,status&access_token=${encodeURIComponent(accessToken)}`;

        const response = await fetch(endpoint);
        const result: any = await response.json();
        if (!response.ok) return { live_views: 0, status: null };

        return {
            live_views: toNumber(result?.live_views),
            status: result?.status ?? null,
        };
    } catch {
        return { live_views: 0, status: null };
    }
};
