const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Section = sequelize.define(
  "Section",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sectionName: { type: DataTypes.STRING, allowNull: false },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "courses", key: "_id" },
      onDelete: "CASCADE",
    },
  },
  { tableName: "sections", timestamps: false }
);

module.exports = Section;
