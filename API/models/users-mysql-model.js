// Model of the user entity for MySQL database
// Every method writes a log in the database

import mysql from 'mysql2/promise'

import { writeNewUser, getUserID, writeGeneralLog, loginUser, writeLoginLog, modifyPassword, modifyUsername, deleteUser, getUserByID, getAllUsers } from './model-functions.js'

// Configuration object for MySQL connection
const config = {
  host: 'localhost',
  user: 'root',
  port: '3306',
  password: 'NetControlSolutionsDB',
  database: 'NetControlDB'
}

const connection = await mysql.createConnection(config)

const generalTables = ['registerLogs', 'deleteLogs', 'usernameChangesLogs', 'passwordChangesLogs']

// Model of the user entity to interact with the MySQL database
export class UserModel {
  // Get all users from the database
  static async getAllUsers () {
    const users = getAllUsers()
    return users
  }

  // Get a user by its ID
  static async getUserById ({ id }) {
    const user = getUserByID(id)
    return user
  }

  // Register a new user in the database with data provided
  // Data must be an object with the following properties:
  // name, surname, username, email, birthDate, password
  static async registerUser ({ input }) {
    try {
      const newUser = await writeNewUser(input)
      const username = newUser.username
      const idUser = await getUserID(username)

      // Write log
      await writeGeneralLog(idUser, generalTables[0])
      return newUser
    } catch (error) {
      throw new Error('Error at registering user')
    }
  }

  // Login a user with username and password provided
  static async loginUser ({ username, password }) {
    try {
      const userLogged = await loginUser({ username, password })
      if (!userLogged) {
        // Write failed login log
        try {
          const status = 'failed'
          await writeLoginLog(null, status, username)
        } catch (error) {
          throw new Error('Error at writing log')
        }
        return false
      }

      const idUser = await getUserID(username)
      // Write success login log
      try {
        const status = 'success'
        await writeLoginLog(idUser, status, username)
      } catch (error) {
        throw new Error('Error at writing log')
      }
      return true
    } catch (error) {
      throw new Error('Error at login')
    }
  }

  // Modify the password of a user with username provided
  static async modifyPassword ({ username, oldPassword, newPassword }) {
    try {
      await modifyPassword({ username, oldPassword, newPassword })
      // Write log
      const idUser = await getUserID(username)
      await writeGeneralLog(idUser, generalTables[3])
      return true
    } catch (error) {
      throw new Error('Error at modifying password')
    }
  }

  // Modify the username of a user with username provided
  static async modifyUsername ({ username, password, newUsername }) {
    try {
      await modifyUsername({ username, password, newUsername })
      // Write log
      const idUser = await getUserID(newUsername)
      await writeGeneralLog(idUser, generalTables[2])
      return true
    } catch (error) {
      throw new Error('Error at modifying username')
    }
  }

  // Delete the user that matches the username and password provided
  static async deleteUser ({ username, password }) {
    try {
      await deleteUser({ username, password })
      // Write log
      const idUser = await getUserID(username)
      await writeGeneralLog(idUser, generalTables[1])

      return true
    } catch (error) {
      throw new Error('Error al eliminar usuario')
    }
  }

  // Check if there is a user registred with the username provided
  static async usernameExists ({ username }) {
    const [user] = await connection.query('SELECT username FROM users WHERE username = ?', [username])
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
