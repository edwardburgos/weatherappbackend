const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('country', {
    nameLower: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    nameNormal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codeBig: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
};