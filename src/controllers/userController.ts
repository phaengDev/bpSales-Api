import { Request, Response } from "express";
import Users from "../models/Users";
import { maxid } from "../utils";
// import jwt from "jsonwebtoken";
const bcrypt = require('bcryptjs');
// const secret = process.env.JWT_SECRET || "OAC-Insurance@2026";
interface QueryParams {
  limit?: string;
  skip?: string;
  orderBy?: string;
  order?: string;
}

// Get all users
export const getUsers = async (req: Request<{id: string}, {}, {}, QueryParams>, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const orderBy = req.query.orderBy || "user_uuid";
    const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
    const shopid = req.params.id;
    const { rows, count } = await Users.findAndCountAll({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Create user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
     const password = req.body.password;
     const hashedPassword = bcrypt.hashSync(password, 10);

    const new_uuid = await maxid(Users, "user_uuid");
    req.body.user_uuid = new_uuid;
     req.body.password = hashedPassword;

    const existingUser = await Users.findOne({ where: { phones: req.body.phones } });
    if (existingUser) {
      res.status(409).json({ error: "User with this phone number already exists" });
      return;
    }
    const user = await Users.create(req.body);
    res.status(200).json({ message: "User created successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};


// Get single user
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user_uuid = atob(req.params.id);
    const user = await Users.findByPk(user_uuid, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user_uuid = atob(req.params.id); 
    req.body.updatedAt = new Date();
    if ('password' in req.body) {
      delete req.body.password;
    }
    const updated = await Users.update(req.body, {
      where: { user_uuid: user_uuid },
    });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete user
export const deleteUser = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user_uuid = atob(req.params.id);
    const user = await Users.findByPk(user_uuid);
    if (!user) return res.status(404).json({ error: "User not found" });
    const deleted = await Users.destroy({
      where: { user_uuid: user_uuid },
    });
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const getUserOption = async (req: Request, res: Response) => {
  try {
    const shopid = req.params.id;
    const user = await Users.findAll({
      where: { shopid: shopid, status: 1 },
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({data:user});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};