const mongoose = require('mongoose')
const User = require('./User')
const MSchema = mongoose.Schema

const postSchema = new MSchema({
    comment: String,
    userId: String
})

module.exports = mongoose.model('Post',postSchema)