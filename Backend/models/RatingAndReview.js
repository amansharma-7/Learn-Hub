const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RatingAndReviews = sequelize.define(
  "RatingAndReviews",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.FLOAT, allowNull: false },
    review: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "rating_and_reviews", timestamps: false }
);

module.exports = RatingAndReviews;
