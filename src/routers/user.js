const express = require('express')
const User = require('../models/user.js')
const {
  sendWelcomeEmail,
  sendCancellationEmail
} = require('../emails/accounts.js')
const auth = require('../middleware/auth.js')
const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router()

// Multer configuration
const upload = multer({
  // dest: 'avatars',  I want to save in the DB not in a folder
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|png|jpg)$/)) {
      // ends with .jpeg/jpg/png
      return cb(new Error('Only images'))
    }
    cb(null, true)
  }
})

router.route('/').post(async (req, res) => {
  // CREATE A NEW USER
  const user = new User(req.body)
  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken() // create token at signup so the user does not have to login
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
})

router
  .route('/me')
  .get(auth, async (req, res) => {
    // get my profile
    res.send(req.user)
  })

  // .get(auth, async (req, res) => {

  //   // try {
  //   //   const users = await User.find({})
  //   //   res.send(users)
  //   // } catch (error) {
  //   //   res.status(500).send('Couldnt fetch users. Server is down')
  //   // }
  // })

  // router
  // .route('/:id')
  // .get(async (req, res) => {
  //   const id = req.params.id
  //   try {
  //     const foundUser = await User.findById(id)
  //     if (!foundUser) {
  //       // if user is null. Correct syntax (id) but returns null coz was not found
  //       return res.status(404).send('ERROR: User not found') // NOT FOUND status
  //     }
  //     res.send(foundUser)
  //   } catch (error) {
  //     res.status(500).send() // wrong syntax (id)
  //   }
  // })
  // .patch(auth, async (req, res) => {
  //   // handling invalid fields to be updated
  //   const updates = Object.keys(req.body)
  //   const allowedUpdates = ['name', 'email', 'age', 'password']
  //   const isValidOperation = updates.every((update) =>
  //     allowedUpdates.includes(update)
  //   ) // every returns true if gets true in all iterations
  //   if (!isValidOperation) {
  //     return res.status(400).send({ error: 'Invalid updates!' })
  //   }

  //   try {
  //     // change how to update the user to get mongoose middleware to work
  //     const user = await User.findById(req.params.id) // get the user and modify below
  //     updates.forEach((update) => (user[update] = req.body[update])) // values being updated are passed dynamically
  //     await user.save() // save it back to the database
  //     // const updatedUser = await User.findByIdAndUpdate(
  //     //   req.params.id,
  //     //   req.body,
  //     //   { new: true, runValidators: true }
  //     // ) // run validators on updated data
  //     if (!user) {
  //       return res.status(404).send() //not found to be updated
  //     }
  //     res.send(user)
  //   } catch (error) {
  //     res.status(400).send(error) //handling validation error ???
  //   }
  // })

  .patch(auth, async (req, res) => {
    // handling invalid fields to be updated
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    ) // every returns true if gets true in all iterations
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
      updates.forEach((update) => (req.user[update] = req.body[update])) // values being updated are passed dynamically
      await req.user.save() // save it back to the database and run validation
      res.send(req.user)
    } catch (error) {
      res.status(400).send(error) //handling validation error
    }
  })

  .delete(auth, async (req, res) => {
    try {
      // const user = await User.findByIdAndDelete(req.user._id)
      // if (!user) {
      //   return res.status(404).send('User not found!')
      // }
      await req.user.remove() // user is attached to the req (in the auth middleware)
      sendCancellationEmail(req.user.email, req.user.name)
      res.send('User deleted')
    } catch (error) {
      res.status(500).send()
    }
  })

router.post(
  '/me/avatar',
  auth,
  upload.single('avatar'), // Multer will make the file available in the req (will run validations)
  async (req, res) => {
    const formattedBuffer = await sharp(req.file.buffer)
      .resize({ width: 300, height: 300 })
      .png()
      .toBuffer()
    req.user.avatar = formattedBuffer
    await req.user.save()
    res.status(200).send()
  },
  (error, req, res, next) => {
    // catches the error thrown by the upload middleware
    res.status(400).send({ error: error.message })
  }
)

router.get('/me/avatar', auth, async (req, res) => {
  try {
    if (!req.user.avatar) {
      throw new Error()
    }
    res.set('Content-Type', 'image/jpg')
    res.send(req.user.avatar)
  } catch (error) {
    res.send({ error: error.message })
  }
})

router.delete('/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.status(200).send()
})

router.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    res.set('Content-Type', 'image/jpg') // set header with type of content to be rendered
    res.send(user.avatar)
  } catch (error) {
    res.send({ error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    // custom mongoose schema method
    const user = await User.findByCredentials(req.body.email, req.body.password) // authenticate user
    const token = await user.generateAuthToken()
    res.send({ user, token }) //
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      // filter out of the array the token that was used for auth. method creates a new array with all elements that pass the test implemented
      return token !== req.token
    })
    await req.user.save() // update user in the DB
    res.send('Logged out')
  } catch (error) {
    res.status(500).send()
  }
})

router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send('Logged out from all')
  } catch (error) {
    res.status(500).send()
  }
})

module.exports = router
