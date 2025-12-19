"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database"); // ✅ notice 
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
// Import routes
const auth_controller_1 = require("./middleware/auth.controller");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*", // frontend origin
    // credentials: false,
    // methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    // allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json()); // parse JSON requests
app.get("/auth/verify", auth_controller_1.verifyTokenController);
app.use("/api/", routes_1.default);
app.use('/image', express_1.default.static(path_1.default.resolve(__dirname, 'uploads/')));
// Health check
app.get("/", (req, res) => {
    res.send("✅ API is running...");
});
// Database connection
database_1.sequelize.authenticate()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.error("❌ DB connection error:", err));
exports.default = app;
