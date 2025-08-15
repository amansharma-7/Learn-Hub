const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Course = sequelize.define(
  "Course",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    courseName: { type: DataTypes.STRING, allowNull: false },
    courseDescription: { type: DataTypes.STRING, allowNull: false },
    whatWillYouLearn: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    thumbnail: { type: DataTypes.STRING },
    tag: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    instructions: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    status: {
      type: DataTypes.ENUM("Draft", "Published"),
      defaultValue: "Draft",
    },
    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "_id" },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "categories", key: "_id" },
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "courses", timestamps: false }
);

module.exports = Course;
