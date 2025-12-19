"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const database_1 = require("./config/database"); // ✅ notice { }
const PORT = process.env.PORT || 3707;
async function startServer() {
    try {
        await database_1.sequelize.authenticate();
        console.log("✅ Database connected!");
        server_1.default.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Unable to connect to DB:", error);
    }
}
startServer();
