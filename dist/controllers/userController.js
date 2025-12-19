"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = exports.getUsers = void 0;
const Users_1 = __importDefault(require("../models/Users"));
const utils_1 = require("../utils");
// import jwt from "jsonwebtoken";
const bcrypt = require('bcryptjs');
// Get all users
const getUsers = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "user_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const shopid = req.params.id;
        const { rows, count } = await Users_1.default.findAndCountAll({
            where: { shopid: shopid },
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: { exclude: ["password"] },
        });
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getUsers = getUsers;
// Create user
const createUser = async (req, res) => {
    try {
        const password = req.body.password;
        const hashedPassword = bcrypt.hashSync(password, 10);
        const new_uuid = await (0, utils_1.maxid)(Users_1.default, "user_uuid");
        req.body.user_uuid = new_uuid;
        req.body.password = hashedPassword;
        const existingUser = await Users_1.default.findOne({ where: { phones: req.body.phones } });
        if (existingUser) {
            res.status(409).json({ error: "User with this phone number already exists" });
            return;
        }
        const user = await Users_1.default.create(req.body);
        res.status(200).json({ message: "User created successfully", data: user });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
};
exports.createUser = createUser;
// Get single user
const getUserById = async (req, res) => {
    try {
        const user_uuid = atob(req.params.id);
        const user = await Users_1.default.findByPk(user_uuid, {
            attributes: { exclude: ["password"] },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
exports.getUserById = getUserById;
// Update user
const updateUser = async (req, res) => {
    try {
        const user_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        if ('password' in req.body) {
            delete req.body.password;
        }
        const updated = await Users_1.default.update(req.body, {
            where: { user_uuid: user_uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: "User updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const user_uuid = atob(req.params.id);
        const user = await Users_1.default.findByPk(user_uuid);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const deleted = await Users_1.default.destroy({
            where: { user_uuid: user_uuid },
        });
        if (!deleted)
            return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: "User deleted successfully", data: user });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
