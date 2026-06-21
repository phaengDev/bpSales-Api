import app from "./server";
import { sequelize } from "./config/database"; // ✅ notice { }
const PORT = process.env.PORT || 3707;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected!");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to DB:", error);
  }
}


startServer();
