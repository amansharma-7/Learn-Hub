const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SubSection = sequelize.define(
  "SubSection",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    timeDuration: DataTypes.STRING,
    description: DataTypes.TEXT,
    videoUrl: DataTypes.STRING,
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "sections", key: "_id" },
      onDelete: "CASCADE",
    },
  },
  { tableName: "sub_sections", timestamps: false }
);

module.exports = SubSection;
