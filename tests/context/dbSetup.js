const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user.js')
const Task = require('../../src/models/task.js')

const userTestID = new mongoose.Types.ObjectId()
const userTest = {
  _id: userTestID,
  name: 'User Test',
  email: 'iamatestuda@gmail.com',
  password: 'canyoutestwithme?',
  tokens: [
    {
      token: jwt.sign({ _id: userTestID }, process.env.JWT_SECRET)
    }
  ]
}

const userTestTwoID = new mongoose.Types.ObjectId()
const userTestTwo = {
  _id: userTestTwoID,
  name: 'User Test Two',
  email: 'usertesttwo@gmail.com',
  password: 'testingalothere!',
  tokens: [
    {
      token: jwt.sign({ _id: userTestTwoID }, process.env.JWT_SECRET)
    }
  ]
}

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Task One',
  completed: false,
  owner: userTest._id
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Task Two',
  completed: true,
  owner: userTest._id
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Task Three',
  completed: false,
  owner: userTestTwo._id
}

const setUpDatabase = async () => {
  await User.deleteMany() // erase all docs in DB
  await Task.deleteMany()
  await new User(userTest).save() // adds a sample user for testing
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
}

module.exports = {
  userTest,
  setUpDatabase,
  userTestTwo,
  taskOne,
  taskTwo,
  taskThree
}
