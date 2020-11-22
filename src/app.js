import express from 'express'
import './db/mongoose.js'
import { router as userRouter } from './routers/user.js'
import { router as taskRouter } from './routers/task.js'

// import dotenv from 'dotenv'
// dotenv.config()
const app = express()

app.use(express.urlencoded({ extended: true })) // instead of body parser
app.use(express.json()) // parses application JSON
// app,use(express.urlencoded({ extended: true })) // parsed form data
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

// with middleware: new request -> do something -> run route handler
export { app }
