import jwt from 'jsonwebtoken'
import { User } from '../models/user.js'

export default async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '') // replace the first by the second. Cut out bearer
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({
      _id: decodedUser._id,
      'tokens.token': token
    }) //This is how we can access a key of an object inside an array of objects in Mongoose. token = array, token = key
    if (!user) {
      throw new Error()
    }
    req.token = token
    req.user = user
    next()
  } catch (error) {
    res.status(403).send({ error: 'Please authenticate' })
  }
}
