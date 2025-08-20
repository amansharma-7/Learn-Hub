const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST || "localhost",
//     dialect: "postgres",
//     port: 5432,
//     logging: false,
//   }
// );

// module.exports = sequelize;
const sequelize = new Sequelize(process.env.NEON_DB_KEY, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false, // 👈 disables SQL logging
});
module.exports = sequelize;
