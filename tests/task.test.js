const app = require('../src/app.js')
const request = require('supertest')
const Task = require('../src/models/task.js')
const {
  userTest,
  setUpDatabase,
  userTestTwo,
  taskOne,
  taskTwo,
  taskThree
} = require('./context/dbSetup.js')

beforeEach(setUpDatabase)

test('Should create a new task and check if logged-in user is the owner', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userTest.tokens[0].token}`)
    .send({ description: 'Create Unit Tests' })
    .expect(201)

  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  expect(task.owner).toEqual(userTest._id)
})

test('Should retrieve only tasks created by a specific user', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userTest.tokens[0].token}`)
    .expect(200)

  const tasks = response.body.tasks

  expect(response.body.length).toBe(2)
})

test('Should not delete a task created by another user', async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTestTwo.tokens[0].token}`)
    .expect(403)

  const task = await Task.findById(taskOne._id)
  expect(task).not.toBeNull()
})
