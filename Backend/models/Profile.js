const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Profile = sequelize.define(
  "Profile",
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gender: DataTypes.STRING,
    dateOfBirth: DataTypes.STRING,
    about: DataTypes.STRING,
    contactNumber: DataTypes.BIGINT,
  },
  {
    tableName: "profiles",
    timestamps: false,
  }
);

module.exports = Profile;
