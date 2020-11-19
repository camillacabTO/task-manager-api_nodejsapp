import mongoose from 'mongoose'
import { userModel as User } from '../models/user.js'
import { taskModel as Task } from '../models/task.js'

mongoose.connect('mongodb://localhost/task-manager-api', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

const id = ''

// User.findById(id).then(user => {
//     return User.find({ age: user.age })
// }).then((users) => {
//     console.log(users.length)
// })

// Task.findByIdAndDelete('5f91e522d5a48b556c7cc667')
// .then((deletedTask)=> {
//     return Task.estimatedDocumentCount()
// })
// .then((totalTasks) => { console.log(totalTasks)})
