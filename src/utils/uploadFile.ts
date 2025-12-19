import multer from "multer";
import path from "path";
import fs from "fs";
export const createUpload = (folderName: string) => {
  const uploadPath = path.join(__dirname, "..", "uploads", folderName);
  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_, __, cb) => {
      cb(null, uploadPath);
    },
    filename: (_, file, cb) => {
      const unique = `${Date.now()}${Math.round(Math.random() * 1e5)}${path.extname(file.originalname)}`;
      cb(null, unique);
    },
  });
  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });
};
/** * Delete a file from the specified folder
 * - Returns true if deleted successfully, false otherwise
 */
export const deleteFile = (folderName: string, fileName: string): boolean => {
  try {
    const filePath = path.join(__dirname, "..", "uploads", folderName, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false; // File not found
  } catch (error) {
    console.error(`Error deleting file "${fileName}" from folder "${folderName}":`, error);
    return false;
  }
};

/**
 * Replace an existing file with a new one (edit file)
 * - Deletes the old file if it exists
 * - Returns the new filename or null if failed
 */
export const editFile = (
  folderName: string,
  oldFileName: string | null,
  newFile: Express.Multer.File | undefined
): string | null => {
  try {
    if (!newFile) return null;
    if (oldFileName) {
      deleteFile(folderName, oldFileName);
    }
    return newFile.filename;
  } catch (error) {
    console.error("Error editing file:", error);
    return null;
  }
};
