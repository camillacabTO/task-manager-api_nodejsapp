import mongoose from 'mongoose'
import assert from 'assert'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { taskModel as Task } from './task.js'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true, // removes whitespace
      lowercase: true,
      validate(val) {
        assert.ok(validator.isEmail(val), 'Email is invalid')
      }
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        assert.ok(value >= 0, 'Age must be a positive number') // test for false. if yes, throws a error
        // same as: if (value < 0) {
        //     throw new Error('bla')
        // }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(val) {
        assert.ok(
          !val.toLowerCase().includes('password'),
          'Password must not include "password"'
        )
        // assert.ok(val.length > 6, 'Password has to be at least 6 characters long')
      }
    },
    avatar: {
      type: Buffer
    },
    tokens: [
      {
        // array of objects, each with a token property
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true // out of the schema structure. Second option toe schema obj
  }
)

// virtual property: is a way to set a relationship between two models. It doesnt change what its stored in the document or in the database.

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', // primary key. What is associate from this schema to the other
  foreignField: 'owner' // foreign key. in which field is stored in the other schema
})

//MONGOOSE MIDDLEWARE

userSchema.methods.toJSON = function () {
  // no arrow function if using 'this' inside
  // everytime res.send is called, Express call JSON.stringify (which calls toJSON). We can over write toJSON to control what information will be send back in the res.send. Hide stuff

  const user = this.toObject() //  converts the mongoose document into a plain JavaScript object.
  delete user.password
  delete user.tokens
  delete user.avatar // too long. slow down response

  return user
}

userSchema.methods.generateAuthToken = async function () {
  // instance methods
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET) // data load and secret to create token
  user.tokens = user.tokens.concat({ token }) // concat this token to the array of user's tokens
  user.save()
  return token
}

userSchema.statics.findByCredentials = async (email, password) => {
  // static method. Model methods
  // applying a custom method to a schema
  const user = await User.findOne({ email }) // have to user the model, not the schema here

  if (!user) {
    // does not exist
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Unable to login') // provide generic info
  }
  return user
}

userSchema.pre('save', async function (next) {
  // applying a middleware to a schema
  // does something before the event 'save'.
  // it has to be a regular func, not arrow func
  const user = this
  console.log('just before saving into MongooDB')
  if (user.isModified('password')) {
    // Mongoose checks if password was modified before saving the document and will run for creating a new user and when the user updates password
    user.password = await bcrypt.hash(user.password, 10)
    console.log('password hashed')
  }
  next()
})

//Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

export const User = mongoose.model('User', userSchema)

// const me = new userModel({
//     name: 'Mary',
//     email: 'mary@gmail.com',
//     password: '123Password',
//     age: 50
// }).save()
//     .then((me) => {
//     console.log(me)
// }).catch((err) => console.log('ERROR: ' + err))
