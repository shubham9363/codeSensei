const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Submission = sequelize.define("Submission", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "problem"
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  feedback: DataTypes.TEXT,
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "submissions",
  timestamps: false
});

module.exports = Submission;