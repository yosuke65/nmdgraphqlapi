const mongoose = require('mongoose')
const MSchema = mongoose.Schema

const loginResponseSchema = new MSchema({
    status: Boolean,
    token: String
})

module.exports = mongoose.model('LoginResponse', loginResponseSchema)