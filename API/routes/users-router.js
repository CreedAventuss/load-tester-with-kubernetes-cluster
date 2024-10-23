// Router for users

import { Router } from 'express'
import { UserController } from '../controllers/user-controller.js'

// User model is passed as a parameter
export const createUsersRouter = ({ userModel }) => {
  const usersRouter = Router()
  // Create a new instance of the user controller with the user model
  const userController = new UserController({ userModel })

  // Every route calls a method from the user controller
  usersRouter.get('/', userController.getAllUsers)
  usersRouter.get('/:id', userController.getUserById)
  usersRouter.post('/register', userController.registerUser)
  usersRouter.post('/login', userController.loginUser)
  usersRouter.patch('/changepassword', userController.modifyPassword)
  usersRouter.patch('/changeusername', userController.modifyUsername)
  usersRouter.delete('/:id', userController.deleteUser)

  return usersRouter
}
