const app = require('../src/app.js')
const request = require('supertest')
const User = require('../src/models/user.js')

const userTest = {
  name: 'Duda',
  email: 'iamduda@gmail.com',
  password: 'dudimf098!'
}

beforeEach(async () => {
  await User.deleteMany() // erase all docs in DB
  await new User(userTest).save() // adds a sample user for testing
})

test('Should create a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Luke',
      password: 'LukeDog2020!',
      email: 'iamluke@gmail.com'
    })
    .expect(201)
})

test('Should login existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userTest.email,
      password: userTest.password
    })
    .expect(200)
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
