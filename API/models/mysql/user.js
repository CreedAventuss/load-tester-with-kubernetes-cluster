import mysql from 'mysql2/promise'

import { encrypt } from '../../encryptText.js'

const config = {
  host: 'localhost',
  user: 'root',
  port: '3306',
  password: 'NetControlSolutionsDB',
  database: 'NetControlDB'
}

const SECRET_KEY = 'SecretKeyNetControlSolutionsSL'

const connection = await mysql.createConnection(config)

export class UserModel {
  static async getAllUsers () {
    const [users] = await connection.query('SELECT * FROM users')
    return users
  }

  static async getUserById ({ id }) {
    const [user] = await connection.query('SELECT * FROM users WHERE idUser = ?', [id])
    return user
  }

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

    // Encrypt password here:
    const encryptedPassword = encrypt(password, SECRET_KEY)

    try {
      await connection.query(
        'INSERT INTO users (name, surname, username, email, birthDate, password, registerDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, surname, username, email, birthDate, encryptedPassword, registerDate]
      )

      const [newUser] = await connection.query('SELECT * FROM users WHERE username = ?', [username])
      return newUser
    } catch (error) {
      throw new Error('Error at registering user')
    }
  }

  static async loginUser ({ username, password }) {
    // Encrypt password here:
    const encryptedPassword = encrypt(password, SECRET_KEY)
    try {
      const [user] = await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, encryptedPassword])
      if (user.length === 0) {
        return null
      }
      return user
    } catch (error) {
      throw new Error('Error at login')
    }
  }

  static async modifyPassword ({ username, oldPassword, newPassword }) {
    // Encrypt oldPassword and newPassword here:
    oldPassword = encrypt(oldPassword, SECRET_KEY)
    newPassword = encrypt(newPassword, SECRET_KEY)

    const [user] = await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, oldPassword])
    if (user.length === 0) {
      return null
    }

    try {
      await connection.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, username])
      return true
    } catch (error) {
      throw new Error('Error at modifying password')
    }
  }

  static async modifyUsername ({ username, password, newUsername }) {
    // Encrypt password here:
    password = encrypt(password, SECRET_KEY)
    const [user] = await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
    if (user.length === 0) {
      return null
    }

    try {
      await connection.query('UPDATE users SET username = ? WHERE username = ?', [newUsername, username])
      return true
    } catch (error) {
      throw new Error('Error al modificar nombre de usuario')
    }
  }

  static async deleteUser ({ username, password }) {
    // Encrypt password here:
    password = encrypt(password, SECRET_KEY)
    const [user] = await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
    if (user.length === 0) {
      return null
    }

    try {
      await connection.query('DELETE FROM users WHERE username = ?', [username])
      return true
    } catch (error) {
      throw new Error('Error al eliminar usuario')
    }
  }

  static async userExists ({ username }) {
    const [user] = await connection.query('SELECT * FROM users WHERE username = ?', [username])
    // Retorna true si hay un usuario con ese nombre de usuario (user.length > 0, si es mayor a 0, hay un usuario)
    return user.length > 0
  }
}
