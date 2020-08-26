const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fields = {
    username: {
        type: String
    },
    creationDate: {
        type: Number
    },
    imgLink: {
        type: String
    },
    publicID: {
        type: String
    },
    comments: [{
        user: { type: String },
        content: { type: String },
        date: { type: Number }
    }],
    likes: {
        type: [String]
    },
    likesAmt: {
        type: Number,
        default: 0
    }
}

const allPhotosSchema = new Schema(fields)
module.exports = mongoose.model('AllPhotos', allPhotosSchema);