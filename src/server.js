import express from 'express'
import mongoose from 'mongoose'
// import dotenv from 'dotenv'
import { router as userRouter } from './routers/user.js'
import { router as taskRouter } from './routers/task.js'

// dotenv.config()
const app = express()
const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`))

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

app.use(express.urlencoded({ extended: true })) // instead of body parser
app.use(express.json()) // parses application JSON
// app,use(express.urlencoded({ extended: true })) // parsed form data
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

// with middleware: new request -> do something -> run route handler
