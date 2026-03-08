const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production (Render.com)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false
  });
} else {
  // Local development
  sequelize = new Sequelize(
    process.env.DB_NAME || "codesensei",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS || "shubh",
    {
      host: process.env.DB_HOST || "localhost",
      dialect: "postgres",
      port: process.env.DB_PORT || 5432,
      logging: false
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected");
    await sequelize.sync({ alter: true });
    console.log("✅ Models synced");
  } catch (error) {
    console.error("❌ DB connection error:", error.message);
  }
};

module.exports = { sequelize, connectDB };