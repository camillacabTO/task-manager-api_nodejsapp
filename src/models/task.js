const mongoose = require('mongoose')

const { Schema } = mongoose

const taskSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
      // reference to another model to create a relationship
    }
  },
  {
    timestamps: true
  }
)

const Task = mongoose.model('Task', taskSchema)

module.exports = Task

// mongoose changes the name. lower case and plural

// const novaTask = new taskModel({
//     description: 'walk luke twice a day '
// }).save()
//     .then((task) => {
//     console.log(task)
// }).catch((err) => console.log('ERROR: ' + err))

// novaTask.save().then((task) => console.log(task))
