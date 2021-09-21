require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DB_USER, DB_PASSWORD, DB_HOST,
} = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/weather`, {
  logging: false,
  native: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 2147483647,
    idle: 10000
  }
});

const basename = path.basename(__filename);

const modelDefiners = [];

fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

modelDefiners.forEach(model => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

const { Country, City, State } = sequelize.models;

Country.hasMany(State);
State.belongsTo(Country);
State.hasMany(City);
City.belongsTo(State);
Country.hasMany(City);
City.belongsTo(Country);


module.exports = {
  ...sequelize.models,
  conn: sequelize,
};
