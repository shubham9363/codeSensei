const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Problem = sequelize.define("Problem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING,
  difficulty: DataTypes.STRING,
  category: DataTypes.STRING,
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  description: DataTypes.TEXT,
  examples: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  constraints: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  starter_code: DataTypes.TEXT,
  solution: DataTypes.TEXT,
  logic_keywords: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  time_complexity: DataTypes.STRING,
  space_complexity: DataTypes.STRING
}, {
  tableName: "problems",
  timestamps: false
});

module.exports = Problem;