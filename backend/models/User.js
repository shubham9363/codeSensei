const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "student"
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  solved: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  bugs_solved: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  last_login: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otp_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: true
  },
  github: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedin: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "users",
  timestamps: false
});

module.exports = User;