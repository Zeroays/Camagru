require('dotenv').config({path: '../../../.env'});
const ip = require('ip');

exports.PORT = process.env.SERVER_PORT || 3002

exports.CLIENT_ORIGIN = process.env.NODE_ENV = '0.0.0.0'
exports.TRUE_CLIENT_ORIGIN = ip.address();

exports.DB_URL = process.env.NODE_ENV = `mongodb+srv://Zeroays:${process.env.MONGO_DB_PWD}@cluster0-hxpge.mongodb.net/test?retryWrites=true&w=majority`
