const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const index = require('./routes/index.js');

require('./db.js');

const server = express();

require('dotenv').config();

server.name = 'API';

server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.use(morgan('dev'));

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

server.use('/', index);

server.use((req, res) => {
  return res.status(500).send('Sorry, an error ocurred');
});

module.exports = server;
