const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('state', {
    nameLower: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nameNormal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING
    }
  });
};
