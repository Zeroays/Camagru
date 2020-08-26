const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fields = {
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    username: {
        type: String
    },
    pwd: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    notification: {
        type: Boolean,
        default: true
    }
}

const userSchema = new Schema(fields)
module.exports = mongoose.model('User', userSchema)