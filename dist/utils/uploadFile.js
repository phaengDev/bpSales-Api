"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFile = exports.deleteFile = exports.createUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createUpload = (folderName) => {
    const uploadPath = path_1.default.join(__dirname, "..", "uploads", folderName);
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
    const storage = multer_1.default.diskStorage({
        destination: (_, __, cb) => {
            cb(null, uploadPath);
        },
        filename: (_, file, cb) => {
            const unique = `${Date.now()}${Math.round(Math.random() * 1e5)}${path_1.default.extname(file.originalname)}`;
            cb(null, unique);
        },
    });
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    });
};
exports.createUpload = createUpload;
/** * Delete a file from the specified folder
 * - Returns true if deleted successfully, false otherwise
 */
const deleteFile = (folderName, fileName) => {
    try {
        const filePath = path_1.default.join(__dirname, "..", "uploads", folderName, fileName);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            return true;
        }
        return false; // File not found
    }
    catch (error) {
        console.error(`Error deleting file "${fileName}" from folder "${folderName}":`, error);
        return false;
    }
};
exports.deleteFile = deleteFile;
/**
 * Replace an existing file with a new one (edit file)
 * - Deletes the old file if it exists
 * - Returns the new filename or null if failed
 */
const editFile = (folderName, oldFileName, newFile) => {
    try {
        if (!newFile)
            return null;
        if (oldFileName) {
            (0, exports.deleteFile)(folderName, oldFileName);
        }
        return newFile.filename;
    }
    catch (error) {
        console.error("Error editing file:", error);
        return null;
    }
};
exports.editFile = editFile;
