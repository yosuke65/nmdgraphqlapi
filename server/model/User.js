const mongoose = require('mongoose')
const MSchema = mongoose.Schema

const userSchema = new MSchema({
    firstname: String,
    lastname: String,
    age: String,
    email: String,
    password: String
})

module.exports = mongoose.model('User',userSchema)