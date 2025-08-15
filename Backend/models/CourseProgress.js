const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CourseProgress = sequelize.define(
  "CourseProgress",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    completedVideos: {
      type: DataTypes.ARRAY(DataTypes.INTEGER), // store subsection IDs
      defaultValue: [],
    },
    progressPercentage: { type: DataTypes.FLOAT, defaultValue: 0 },
    lastAccessed: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "course_progress", timestamps: false }
);

module.exports = CourseProgress;
