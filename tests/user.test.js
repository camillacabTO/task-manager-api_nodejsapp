const app = require('../src/app.js')
const request = require('supertest')
const User = require('../src/models/user.js')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

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

beforeEach(async () => {
  await User.deleteMany() // erase all docs in DB
  await new User(userTest).save() // adds a sample user for testing
})

test('Should create a new user', async () => {
  const res = await request(app)
    .post('/users')
    .send({
      name: 'Luke',
      password: 'LukeDog2020!',
      email: 'iamluke@gmail.com'
    })
    .expect(201)

  const user = await User.findById(res.body.user._id)
  expect(user).not.toBeNull()
})

test('Should login existing user', async () => {
  const res = await request(app)
    .post('/users/login')
    .send({
      email: userTest.email,
      password: userTest.password
    })
    .expect(200)

  const user = await User.findById(res.body.user._id)
  expect(res.body.token).toBe(user.tokens[1].token) // second token. one was created when user signed up. second when logged in
})

test('Should not login with bad credentials', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userTest.email,
      password: 'wrongpassword'
    })
    .expect(400)
})

test('Should give signed-in user access to profile page', async () => {
  const res = await request(app) // saving the response from the server in a var
    .get('/users/me')
    .set('Authorization', `Bearer ${userTest.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not give access to unauthenticated user to profile page', async () => {
  await request(app).get('/users/me').send().expect(403)
})

test('Should delete user account', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userTest.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findOne({
    tokens: {
      token: userTest.tokens[0].token
    }
  })
  expect(user).toBeNull()
})

test('Should not delete user account of an unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(403)
})
