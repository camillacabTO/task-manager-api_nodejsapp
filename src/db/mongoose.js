import mongoose from 'mongoose'

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

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
