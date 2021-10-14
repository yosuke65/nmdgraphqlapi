const express = require('express')
const graphqlHTTP = require('express-graphql').graphqlHTTP
const mongoose = require('mongoose')
const schema = require('./schema/schema')
const testSchema = require('./schema/types_schema')

const port = process.env.PORT || 4000

mongoose.connect('mongodb+srv://graphql:graphql@cluster0.lrxw0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

mongoose.connection.once('open', () => {
    console.log('Yes! We are connected!')
})


const app = express()

app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: schema
}))

app.listen(port, () => {
    console.log('Listening for requests on port 4000');
})