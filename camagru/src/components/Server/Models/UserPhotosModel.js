const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fields = {
    username: {
        type: String
    },
    photos: {
        type: [String],
    }
}

const userPhotosSchema = new Schema(fields)
module.exports = mongoose.model('UserPhotos', userPhotosSchema)