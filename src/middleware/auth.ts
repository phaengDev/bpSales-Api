// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { WhereOptions } from "sequelize";
import Users from "../models/Users.Model";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import Shops from "../models/Shops.Model";
// import TypeUser from "../models/typeUserModel";
const JWT_SECRET = (process.env.JWT_SECRET ?? "Stock-Phaeng@2026").trim();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const JWT_ISSUER = process.env.JWT_ISSUER || "Stock-Phaeng@2026";

// ── Facebook Login ─────────────────────────────────────────
const FACEBOOK_APP_ID = (process.env.FACEBOOK_APP_ID ?? "").trim();
const FACEBOOK_APP_SECRET = (process.env.FACEBOOK_APP_SECRET ?? "").trim();
const GRAPH_URL = `https://graph.facebook.com/${process.env.FACEBOOK_API_VERSION || "v23.0"}`;

// Extend Express.Request to carry our decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        sub?: string;         // standard subject
        phone?: string;
        role?: string;
      };
    }
  }
}

/** ຄົ້ນຫາຜູ້ໃຊ້ທີ່ຍັງໃຊ້ງານຢູ່ ພ້ອມຂໍ້ມູນຮ້ານ */
const findActiveUser = (where: WhereOptions) =>
  Users.findOne({
    where: { ...where, status: 1 },
    include: [{ model: Shops, as: "shop" }],
  });

/** ສ້າງ token + ຂໍ້ມູນຜູ້ໃຊ້ ສຳລັບຕອບກັບໜ້າ login ທຸກຊ່ອງທາງ */
const buildSession = (user: Users) => {
  const plain = user.get({ plain: true }) as any;
  const payload = {
    sub: String(plain.user_uuid),   // <- avoid BigInt
    phone: plain.phone,
    role: plain.typeuser,
    date: new Date().toISOString(),
  };
  const token = jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    issuer: JWT_ISSUER,
  });

  return {
    token,
    user: {
      user_uuid: plain.user_uuid,
      userName: plain.userName,
      phone: plain.phone,
      typeuser: plain.typeuser,
      shopid: plain.shopid,
      shopName: plain.shop?.shopName || null,
      facebookid: plain.facebookid || null,
      created: plain.created,
      updated: plain.updated,
      deleted: plain.deleted,
    },
  };
};

/**
 * POST /auth/login
 * Body: { phone: string, password: string }
 */

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body as any;
    if (!phone || !password) return res.status(400).json({ message: "phone and password are required" });

    const user = await findActiveUser({ phone });
    if (!user) return res.status(401).json({ message: "Invalid phone or password" });

    const hash: any = user.getDataValue("password");
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ message: "Invalid phone or password" });

    if (!JWT_SECRET) return res.status(500).json({ message: "JWT secret not configured" });

    return res.status(200).json({ message: "Login successful", ...buildSession(user) });
  } catch (e) {
    console.error("Error in login:", e);
    return res.status(500).json({ message: "Error logging in" });
  }
};

export type FacebookCheck =
  | { ok: true; facebookId: string; name: string | null }
  | { ok: false; status: number; message: string };

/**
 * ກວດ Access Token ຂອງ Facebook — ສິ່ງສຳຄັນຄື token ຕ້ອງເປັນຂອງແອັບເຮົາເອງ
 * (ຖ້າບໍ່ກວດ app id, token ຈາກແອັບອື່ນກໍຈະ login ເຂົ້າລະບົບເຮົາໄດ້)
 *
 * ມີ FACEBOOK_APP_SECRET → ໃຊ້ debug_token (ລະອຽດກວ່າ: ບອກ is_valid, ວັນໝົດອາຍຸ)
 * ບໍ່ມີ secret       → ໃຊ້ GET /app ດ້ວຍ token ຂອງຜູ້ໃຊ້ ເຊິ່ງຕອບກັບແອັບເຈົ້າຂອງ token
 *                      ແລ້ວທຽບກັບ FACEBOOK_APP_ID (ໃຫ້ຜົນເທົ່າກັນສຳລັບການກວດນີ້)
 */
export const verifyFacebookToken = async (accessToken: string): Promise<FacebookCheck> => {
  if (!FACEBOOK_APP_ID) {
    return { ok: false, status: 500, message: "Facebook login is not configured (FACEBOOK_APP_ID)" };
  }

  try {
    let facebookId = "";

    if (FACEBOOK_APP_SECRET) {
      const appToken = `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`;
      const debugRes = await fetch(
        `${GRAPH_URL}/debug_token?input_token=${encodeURIComponent(accessToken)}` +
        `&access_token=${encodeURIComponent(appToken)}`
      );
      const debug: any = await debugRes.json();
      const info = debug?.data;

      if (!debugRes.ok || !info?.is_valid || !info?.user_id || String(info?.app_id) !== FACEBOOK_APP_ID) {
        return { ok: false, status: 401, message: "Invalid Facebook token" };
      }
      facebookId = String(info.user_id);
    } else {
      const appRes = await fetch(
        `${GRAPH_URL}/app?fields=id&access_token=${encodeURIComponent(accessToken)}`
      );
      const app: any = await appRes.json();

      if (!appRes.ok || String(app?.id) !== FACEBOOK_APP_ID) {
        return { ok: false, status: 401, message: "Invalid Facebook token" };
      }
    }

    const meRes = await fetch(
      `${GRAPH_URL}/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`
    );
    const me: any = meRes.ok ? await meRes.json() : null;

    // ບໍ່ມີ secret ຈຶ່ງເອົາ id ຈາກ /me (token ຖືກຢືນຢັນວ່າເປັນຂອງແອັບເຮົາແລ້ວ)
    if (!facebookId) facebookId = String(me?.id ?? "");
    if (!facebookId) return { ok: false, status: 401, message: "Invalid Facebook token" };

    return { ok: true, facebookId, name: me?.name ?? null };
  } catch (e) {
    console.error("Facebook verify error:", e);
    return { ok: false, status: 502, message: "Cannot reach Facebook" };
  }
};

/**
 * POST /auth/facebook
 * Body: { accessToken: string }
 * ບັນຊີ Facebook ຕ້ອງຖືກຜູກກັບຜູ້ໃຊ້ໄວ້ກ່ອນ — ບໍ່ສ້າງຜູ້ໃຊ້ໃໝ່ອັດຕະໂນມັດ
 * (ຜູ້ໃຊ້ໃໝ່ຈະບໍ່ມີ shopid ແລະ ສິດຂອງຕົນ)
 */
export const loginWithFacebook = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body as any;
    if (!accessToken) return res.status(400).json({ message: "accessToken is required" });

    const verified = await verifyFacebookToken(accessToken);
    if (!verified.ok) return res.status(verified.status).json({ message: verified.message });

    const user = await findActiveUser({ facebookid: verified.facebookId });
    if (!user) {
      return res.status(404).json({
        code: "FACEBOOK_NOT_LINKED",
        message: "This Facebook account is not linked to any user",
        facebookName: verified.name,
      });
    }

    return res.status(200).json({ message: "Login successful", ...buildSession(user) });
  } catch (e) {
    console.error("Error in loginWithFacebook:", e);
    return res.status(500).json({ message: "Error logging in with Facebook" });
  }
};

/**
 * POST /auth/facebook/link
 * Body: { accessToken: string, phone: string, password: string }
 * ຜູກບັນຊີ Facebook ໃສ່ຜູ້ໃຊ້ທີ່ມີຢູ່ແລ້ວ (ຢືນຢັນດ້ວຍລະຫັດຜ່ານ) ແລ້ວເຂົ້າລະບົບເລີຍ
 */
export const linkFacebook = async (req: Request, res: Response) => {
  try {
    const { accessToken, phone, password } = req.body as any;
    if (!accessToken || !phone || !password) {
      return res.status(400).json({ message: "accessToken, phone and password are required" });
    }

    const verified = await verifyFacebookToken(accessToken);
    if (!verified.ok) return res.status(verified.status).json({ message: verified.message });

    const user = await findActiveUser({ phone });
    if (!user) return res.status(401).json({ message: "Invalid phone or password" });

    const hash: any = user.getDataValue("password");
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ message: "Invalid phone or password" });

    // ບັນຊີ Facebook ດຽວ ຜູກໄດ້ກັບຜູ້ໃຊ້ດຽວເທົ່ານັ້ນ
    const taken = await Users.findOne({ where: { facebookid: verified.facebookId } });
    if (taken && taken.getDataValue("user_uuid") !== user.getDataValue("user_uuid")) {
      return res.status(409).json({ message: "This Facebook account is already linked to another user" });
    }

    await user.update({ facebookid: verified.facebookId, updatedAt: new Date() });

    return res.status(200).json({ message: "Facebook account linked", ...buildSession(user) });
  } catch (e) {
    console.error("Error in linkFacebook:", e);
    return res.status(500).json({ message: "Error linking Facebook account" });
  }
};

/**
 * Middleware: verifies Bearer token, attaches decoded payload to req.user
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ status: "401", message: "No Authorization header provided" });
    return;
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ status: "401", message: "Invalid token format (Expected 'Bearer <token>')" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER, }) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ status: "401", message: "Invalid or expired token" });
  }
};
