import { Router } from 'express'
import { UserController } from '../controllers/users.js'

export const createUsersRouter = ({ userModel }) => {
  const usersRouter = Router()
  const userController = new UserController({ userModel })

  usersRouter.get('/', userController.getAllUsers)
  usersRouter.get('/:id', userController.getUserById)
  usersRouter.post('/register', userController.registerUser)
  usersRouter.post('/login', userController.loginUser)
  usersRouter.patch('/changepassword', userController.modifyPassword)
  usersRouter.patch('/changeusername', userController.modifyUsername)

  usersRouter.delete('/:id', userController.deleteUser)

  return usersRouter
}
