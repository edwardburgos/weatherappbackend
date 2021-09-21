const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('city', {
    nameLower: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nameNormal: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
};
