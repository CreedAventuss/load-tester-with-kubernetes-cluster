import { validateUser, validatePartialUser } from '../schemas/users.js'

export class UserController {
  constructor ({ userModel }) {
    this.userModel = userModel
  }

  getAllUsers = async (req, res) => {
    const users = await this.userModel.getAllUsers()
    res.json(users)
  }

  getUserById = async (req, res) => {
    const { id } = req.params
    const user = await this.userModel.getUserById({ id })
    res.json(user)
  }

  registerUser = async (req, res) => {
    const result = validateUser(req.body)
    if (result.error) {
      return res.status(400).json(result.error.message)
    }

    try {
      const userExists = await this.userModel.userExists({ username: req.body.username })
      if (userExists) {
        const username = req.body.username
        return res.status(400).json({ message: `Username ${username} is already in use, try another one` })
      }

      const newUser = await this.userModel.registerUser({ input: req.body })
      res.status(201).json({ message: 'User registered', user: newUser })
    } catch (error) {
      res.status(500).json({ message: 'Error registering user' })
    }
  }

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

    // Para acceder desde el frontend:
    //   const handleLogin = async () => {
    //     try {
    //         const response = await axios.post('http://localhost:3000/users/login', { username, password });
    //         setIsAuthenticated(response.data.isAuth);
    //         setMessage(response.data.message);
    //     } catch (error) {
    //         if (error.response && error.response.status === 401) {
    //             setIsAuthenticated(false);
    //             setMessage(error.response.data.message);
    //         } else {
    //             console.error('Error logging in:', error);
    //             setMessage('An error occurred. Please try again.');
    //         }
    //     }
    // }
  }

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
