"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.login = void 0;
const Users_1 = __importDefault(require("../models/Users"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Shops_1 = __importDefault(require("../models/Shops"));
// import TypeUser from "../models/typeUserModel";
const JWT_SECRET = (process.env.JWT_SECRET ?? "Stock-Phaeng@2026").trim();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const JWT_ISSUER = process.env.JWT_ISSUER || "Stock-Phaeng@2026";
/**
 * POST /auth/login
 * Body: { phones: string, password: string }
 */
const login = async (req, res) => {
    try {
        const { phones, password } = req.body;
        if (!phones || !password)
            return res.status(400).json({ message: "phones and password are required" });
        const user = await Users_1.default.findOne({
            where: { phones, status: 1 },
            include: [{
                    model: Shops_1.default,
                    as: "shop"
                }
            ],
        });
        if (!user)
            return res.status(401).json({ message: "Invalid phones or password" });
        const hash = user.getDataValue("password");
        const ok = await bcryptjs_1.default.compare(password, hash);
        if (!ok)
            return res.status(401).json({ message: "Invalid phones or password" });
        if (!JWT_SECRET)
            return res.status(500).json({ message: "JWT secret not configured" });
        const payload = {
            sub: String(user.getDataValue("user_uuid")), // <- avoid BigInt
            phones: user.getDataValue("phones"),
            role: user.getDataValue("typeuser"),
            date: new Date().toISOString(),
        };
        let token;
        try {
            token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
                algorithm: "HS256",
                expiresIn: "1d",
                issuer: JWT_ISSUER,
            });
        }
        catch (e) {
            console.error("JWT sign error:", e?.name, e?.message);
            res.status(500).json({ message: "Failed to sign token" });
            return;
        }
        const userPlain = user.get({ plain: true });
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
    }
    catch (e) {
        console.error("Error in login:", e);
        return res.status(500).json({ message: "Error logging in" });
    }
};
exports.login = login;
/**
 * Middleware: verifies Bearer token, attaches decoded payload to req.user
 */
const verifyToken = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, { issuer: JWT_ISSUER, });
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ status: "401", message: "Invalid or expired token" });
    }
};
exports.verifyToken = verifyToken;
