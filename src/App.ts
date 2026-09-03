import app from "./server";
import { sequelize } from "./config/database"; // ✅ notice { }
import { syncLiveTables } from "./models/syncLive";
const PORT = process.env.PORT || 3707;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected!");
    await syncLiveTables();
    console.log("✅ tbl_live_* ready");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to DB:", error);
  }
}


startServer();
