// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import Users from "../models/Users";
const JWT_SECRET = (process.env.JWT_SECRET ?? "Stock-Phaeng@2026").trim();
/**
 * For a dedicated /auth/verify endpoint that just returns the decoded token.
 */
export const verifyTokenController = async (req: Request, res: Response): Promise<void> => {
  try {
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
      const decoded = jwt.verify(token, JWT_SECRET);
      res.status(200).json({ status: "200", message: "Token is valid", decoded });
    } catch {
      res.status(401).json({ status: "401", message: "Invalid or expired token  " });
    }
  } catch (error) {
    console.error("Error in verifyTokenController:", error);
    res.status(500).json({ status: "500", message: "Internal Server Error" });
  }
};

// src/controllers/auth.controller.ts

export const getMe = async (req: Request, res: Response) => {
  try {
    const decoded: any = req.user || {};
    const byId = decoded.sub || decoded.user_uuid;     // รองรับทั้งสองแบบ
    const byPhone = decoded.phones;

    let user;
    if (byId) {
      user = await Users.findByPk(byId, { attributes: { exclude: ["password"] } });
    } else if (byPhone) {
      user = await Users.findOne({ where: { phones: byPhone }, attributes: { exclude: ["password"] } });
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "OK",
      data: user, // ไม่มี password แล้ว
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to get profile" });
  }
};
