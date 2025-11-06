// backend/testDB.js
import { db } from "./db.js";

try {
  const [rows] = await db.query("SELECT NOW() AS now");
  console.log("✅ Database connected successfully:", rows[0].now);
  await db.end();
} catch (err) {
  console.error("❌ Database connection failed:", err.message);
}
