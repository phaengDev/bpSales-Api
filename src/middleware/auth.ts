// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import Users from "../models/Users";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import Shops from "../models/Shops";
// import TypeUser from "../models/typeUserModel";
const JWT_SECRET = (process.env.JWT_SECRET ?? "Stock-Phaeng@2026").trim();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const JWT_ISSUER = process.env.JWT_ISSUER || "Stock-Phaeng@2026";

// Extend Express.Request to carry our decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        sub?: string;         // standard subject
        phones?: string;
        role?: string;
      };
    }
  }
}
/**
 * POST /auth/login
 * Body: { phones: string, password: string }
 */

export const login = async (req: Request, res: Response) => {
  try {
    const { phones, password } = req.body as any;
    if (!phones || !password) return res.status(400).json({ message: "phones and password are required" });

    const user = await Users.findOne({
      where: { phones, status: 1 },
      include: [{
        model: Shops,
        as: "shop"
      }
      ],
    });
    if (!user) return res.status(401).json({ message: "Invalid phones or password" });

    const hash: any = user.getDataValue("password");
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ message: "Invalid phones or password" });

    if (!JWT_SECRET) return res.status(500).json({ message: "JWT secret not configured" });
    const payload = {
      sub: String(user.getDataValue("user_uuid")),   // <- avoid BigInt
      phones: user.getDataValue("phones"),
      role: user.getDataValue("typeuser"),
      date: new Date().toISOString(),
    };
    let token: string;
    try {
      token = jwt.sign(payload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "1d",
        issuer: JWT_ISSUER,
      });
    } catch (e: any) {
      console.error("JWT sign error:", e?.name, e?.message);
      res.status(500).json({ message: "Failed to sign token" });
      return;
    }
    const userPlain = user.get({ plain: true }) as any;
    const shopName = userPlain.shop?.shopName || null;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_uuid: user.getDataValue("user_uuid"),
        userName: user.getDataValue("userName"),
        phones: user.getDataValue("phones"),
        typeuser: user.getDataValue("typeuser"),
        shopid: user.getDataValue("shopid"),
        shopName: shopName,
        deletes: user.getDataValue("deleted"),
        updates: user.getDataValue("updated"),
        creates: user.getDataValue("created"),
      },
    });
  } catch (e) {
    console.error("Error in login:", e);
    return res.status(500).json({ message: "Error logging in" });
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
