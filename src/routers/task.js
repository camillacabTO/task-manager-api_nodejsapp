const express = require('express')
const Task = require('../models/task.js')
const auth = require('../middleware/auth.js')
const router = new express.Router()

router
  .route('/')
  .post(auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
      // add owner id
      ...req.body,
      owner: req.user._id
    })
    try {
      await task.save()
      res.status(201).send(req.body) // CREATED
    } catch (error) {
      res.status(400).send(error) // BAD REQUEST
    }
  })

  // GET: /tasks?completed=true
  // GET: /tasks?limit=10?skip=20
  //GET /tasks?sortBy=createdAt:desc
  .get(auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
      match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
      // const tasks = await Task.find({})
      await req.user
        .populate({
          path: 'tasks',
          match,
          options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
          }
        })
        .execPopulate() // populating the virtual property tasks in this document
      res.send(req.user.tasks)
    } catch (error) {
      res.status(500).send('Couldnt fetch tasks. Server is down')
    }
  })

router
  .route('/:id')
  .get(auth, async (req, res) => {
    const _id = req.params.id
    try {
      // const foundTask = await Task.findById(id)
      const task = await Task.findOne({ _id, owner: req.user._id }) // check if the task id in the url belong to the signed in owner

      if (!task) {
        return res.status(404).send('ERROR: Task not found') // NOT FOUND status
      }
      res.send(task)
    } catch (error) {
      res.status(500).send()
    }
  })
  .patch(auth, async (req, res) => {
    const allowedFields = ['description', 'completed']
    const enteredFields = Object.keys(req.body)
    const isValidOperation = enteredFields.every((field) =>
      allowedFields.includes(field)
    )
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
      // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      //   new: true,
      //   runValidators: true,
      // })

      const task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id
      })

      if (!task) {
        return res.status(404).send()
      }

      enteredFields.forEach((field) => (task[field] = req.body[field]))
      await task.save()

      res.send(task)
    } catch (error) {
      res.status(400).send(error)
    }
  })

  .delete(auth, async (req, res) => {
    try {
      // const task = await Task.findByIdAndDelete(req.params.id)
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        owner: req.user._id
      })
      if (!task) {
        return res.status(404).send('Task not found!')
      }
      res.status(200).send('Task Deleted!')
    } catch (error) {
      res.status(500).send()
    }
  })

module.exports = router
