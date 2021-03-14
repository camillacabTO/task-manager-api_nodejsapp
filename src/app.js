const express = require('express')
const cors = require('cors')
require('./db/mongoose.js')
const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task.js')

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true })) // instead of body parser
app.use(express.json()) // parses application JSON
// app,use(express.urlencoded({ extended: true })) // parsed form data
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

// with middleware: new request -> do something -> run route handler
module.exports = app
