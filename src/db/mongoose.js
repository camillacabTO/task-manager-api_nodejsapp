const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log(process.env.MONGODB_URL);

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
