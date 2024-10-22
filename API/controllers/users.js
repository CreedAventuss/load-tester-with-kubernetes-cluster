// Controller for users
import { validateUser, validatePartialUser } from '../schemas/users.js'

// Class to manage users
// All methods call the model to interact with the database
// Controllers are responsible for handling requests and responses
// Also controller validates the request data
// All methods are wrapped with try-catch to handle errors
export class UserController {
  // Constructor receives the user model to know whom to call
  constructor ({ userModel }) {
    this.userModel = userModel
  }

  // Get all users
  // Respond with a JSON object with all users
  getAllUsers = async (req, res) => {
    const users = await this.userModel.getAllUsers()
    res.json(users)
  }

  // Get user by id
  // Respond with a JSON object with the user
  getUserById = async (req, res) => {
    const { id } = req.params
    const user = await this.userModel.getUserById({ id })
    res.json(user)
  }

  // Register a new user
  // Respond with a JSON object with the new user and a success message
  registerUser = async (req, res) => {
    const result = validateUser(req.body)
    if (result.error) {
      return res.status(400).json(result.error.message)
    }

    // First check if username or email already exists
    try {
      const userExists = await this.userModel.userExists({ username: req.body.username })
      if (userExists) {
        const username = req.body.username
        return res.status(400).json({ message: `Username ${username} is already in use, try another one` })
      }

      const emailExists = await this.userModel.emailExists({ email: req.body.email })
      if (emailExists) {
        const email = req.body.email
        return res.status(400).json({ message: `Email ${email} is already in use, try another one` })
      }

      const newUser = await this.userModel.registerUser({ input: req.body })
      res.status(201).json({ message: 'User registered', user: newUser })
    } catch (error) {
      res.status(500).json({ message: 'Error registering user' })
    }
  }

  // Login a user
  // If the user is found in the database, return a message with { isAuth: true }
  // This object can be used in the frontend to know if the user is authenticated
  loginUser = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const loggedUser = await this.userModel.loginUser({ username, password })
      if (loggedUser) {
        const username = loggedUser[0].username
        return res.json({ message: `User ${username} logged in successfully`, isAuth: true })
      } else {
        return res.status(401).json({ message: 'Invalid username or password', isAuth: false })
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error logging in' })
    }
  }

  // Modify user password
  // Respond with a success message if the password is modified
  modifyPassword = async (req, res) => {
    const result = validatePartialUser(req.body)
    if (result.error) {
      return res.status(400).json(result.error.message)
    }

    const { username, oldPassword, newPassword } = req.body

    // Check if required fields are missing
    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const modifiedUser = await this.userModel.modifyPassword({ username, oldPassword, newPassword })

      if (modifiedUser) {
        return res.json({ message: 'Password modified successfully' })
      } else {
        return res.status(401).json({ message: 'Invalid username or password' })
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error modifying password' })
    }
  }

  // Modify username
  // Respond with a success message if the username is modified
  modifyUsername = async (req, res) => {
    const result = validatePartialUser(req.body)
    if (result.error) {
      return res.status(400).json(result.error.message)
    }

    const { username, password, newUsername } = req.body
    if (!username || !password || !newUsername) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const modifiedUser = await this.userModel.modifyUsername({ username, password, newUsername })

      if (modifiedUser) {
        return res.json({ message: 'Username modified successfully' })
      } else {
        return res.status(401).json({ message: 'Invalid username or password' })
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error modifying username' })
    }
  }

  // Delete user
  // Respond with a success message if the user is deleted
  deleteUser = async (req, res) => {
    const result = validatePartialUser(req.body)
    if (result.error) {
      return res.status(400).json(result.error.message)
    }

    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const userToDelete = await this.userModel.deleteUser({ username, password })

      if (userToDelete) {
        return res.json({ message: 'User deleted successfully' })
      } else {
        return res.status(404).json({ message: 'User not found or incorrect password' })
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting user' })
    }
  }
}
