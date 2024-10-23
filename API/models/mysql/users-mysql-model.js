// Model of the user entity for MySQL database
// Every method writes a log in the database

import mysql from 'mysql2/promise'

import { encrypt } from '../../encryptText.js'

// Configuration object for MySQL connection
const config = {
  host: 'localhost',
  user: 'root',
  port: '3306',
  password: 'NetControlSolutionsDB',
  database: 'NetControlDB'
}

// Secret key for encrypting passwords
const SECRET_KEY = 'SecretKeyNetControlSolutionsSL'

const connection = await mysql.createConnection(config)

// Function to verify if a user exists in the database with username and password provided
const verifyUser = async (username, password) => {
  try {
    const [user] = await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
    if (user.length === 0) {
      return false
    }
    return true
  } catch (error) {
    throw new Error('Error at verifying user')
  }
}

// Model of the user entity to interact with the MySQL database
export class UserModel {
  // Get all users from the database
  static async getAllUsers () {
    const [users] = await connection.query('SELECT * FROM users')
    return users
  }

  // Get a user by its ID
  static async getUserById ({ id }) {
    const [user] = await connection.query('SELECT * FROM users WHERE idUser = ?', [id])
    return user
  }

  // Register a new user in the database with data provided
  // Data must be an object with the following properties:
  // name, surname, username, email, birthDate, password
  static async registerUser ({ input }) {
    const registerDate = new Date().toISOString().slice(0, 10)

    const {
      name,
      surname,
      username,
      email,
      birthDate,
      password
    } = input

    const encryptedPassword = encrypt(password, SECRET_KEY)

    try {
      await connection.query(
        'INSERT INTO users (name, surname, username, email, birthDate, password, registerDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, surname, username, email, birthDate, encryptedPassword, registerDate]
      )

      const [newUser] = await connection.query('SELECT * FROM users WHERE username = ?', [username])
      const idUser = newUser[0].idUser

      // Write log
      try {
        const logDate = new Date().toISOString().slice(0, 10)
        await connection.query('INSERT INTO registerLogs (idUser, timeStamp) VALUES (?, ?)', [idUser, logDate])
      } catch (error) {
        throw new Error('Error at writing log')
      }
      return newUser
    } catch (error) {
      throw new Error('Error at registering user')
    }
  }

  // Login a user with username and password provided
  static async loginUser ({ username, password }) {
    // Encrypt password here:
    const encryptedPassword = encrypt(password, SECRET_KEY)

    try {
      const [user] = await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, encryptedPassword])

      if (user.length === 0) {
        // Write failed login log
        try {
          const status = 'failed'
          const logDate = new Date().toISOString().slice(0, 10)
          await connection.query('INSERT INTO loginLogs (timeStamp, status, inputusername) VALUES (?, ?, ?)', [logDate, status, username])
        } catch (error) {
          throw new Error('Error at writing log')
        }
        return null
      }
      const idUser = user[0].idUser
      // Write success login log
      try {
        const status = 'success'
        const logDate = new Date().toISOString().slice(0, 10)
        await connection.query('INSERT INTO loginLogs (idUser, timeStamp, status, inputusername) VALUES (?, ?, ?, ?)', [idUser, logDate, status, username])
      } catch (error) {
        throw new Error('Error at writing log')
      }
      return user
    } catch (error) {
      throw new Error('Error at login')
    }
  }

  // Modify the password of a user with username provided
  static async modifyPassword ({ username, oldPassword, newPassword }) {
    oldPassword = encrypt(oldPassword, SECRET_KEY)
    newPassword = encrypt(newPassword, SECRET_KEY)

    if (!(await verifyUser(username, oldPassword))) {
      return null
    }

    try {
      await connection.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, username])

      // Write log
      try {
        const timeStamp = new Date().toISOString().slice(0, 10)
        const [idUser] = await connection.query('SELECT idUser FROM users WHERE username = ?', [username])
        await connection.query('INSERT INTO passwordChangesLogs (idUser, timeStamp) VALUES (?, ?)', [idUser[0].idUser, timeStamp])
      } catch (error) {

      }
      return true
    } catch (error) {
      throw new Error('Error at modifying password')
    }
  }

  // Modify the username of a user with username provided
  static async modifyUsername ({ username, password, newUsername }) {
    password = encrypt(password, SECRET_KEY)

    if (!(await verifyUser(username, password))) {
      return null
    }

    try {
      await connection.query('UPDATE users SET username = ? WHERE username = ?', [newUsername, username])

      // Write log
      const [idUser] = await connection.query('SELECT idUser FROM users WHERE username = ?', [newUsername])
      const timeStamp = new Date().toISOString().slice(0, 10)
      await connection.query('INSERT INTO usernameChangesLogs (idUser, oldUsername, newUsername, timestamp) VALUES (?, ?, ?, ?)', [idUser[0].idUser, username, newUsername, timeStamp])
      return true
    } catch (error) {
      throw new Error('Error al modificar nombre de usuario')
    }
  }

  // Delete the user that matches the username and password provided
  static async deleteUser ({ username, password }) {
    password = encrypt(password, SECRET_KEY)

    if (!(await verifyUser(username, password))) {
      return null
    }

    try {
      const idUser = await connection.query('SELECT idUser FROM users WHERE username = ?', [username])

      await connection.query('DELETE FROM users WHERE username = ?', [username])
      // Write log
      try {
        const logDate = new Date().toISOString().slice(0, 10)
        await connection.query('INSERT INTO deleteLogs (idUser, timeStamp) VALUES (?, ?)', [idUser.idUser, logDate])
      } catch (error) {
        throw new Error('Error at writing log')
      }
      return true
    } catch (error) {
      throw new Error('Error al eliminar usuario')
    }
  }

  // Check if there is a user registred with the username provided
  static async userExists ({ username }) {
    const [user] = await connection.query('SELECT * FROM users WHERE username = ?', [username])
    // Retorna true si hay un usuario con ese nombre de usuario
    return user.length > 0
  }

  // Check if there is a user registred with the email provided
  static async emailExists ({ email }) {
    const [user] = await connection.query('SELECT * FROM users WHERE email = ?', [email])
    // Retorna true si hay un usuario con ese correo electrónico
    return user.length > 0
  }
}
