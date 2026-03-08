const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const BugProblem = sequelize.define("BugProblem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING,
  difficulty: DataTypes.STRING,
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  description: DataTypes.TEXT,
  buggy_code: DataTypes.TEXT,
  bug_lines: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  hint: DataTypes.TEXT,
  fix_keyword: DataTypes.STRING,
  expected_output: DataTypes.TEXT
}, {
  tableName: "bug_problems",
  timestamps: false
});

module.exports = BugProblem;