import mysql from 'mysql2/promise'

import { encrypt } from '../encryptText.js'

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

const getActualDate = () => {
  const date = new Date().toISOString().slice(0, 10)
  return date
}

// Function to register a new user in the database with data provided
// Returns the user registered
const writeNewUser = async (input) => {
  const {
    name,
    surname,
    username,
    email,
    birthDate,
    password
  } = input

  const encryptedPassword = encrypt(password, SECRET_KEY)
  const registerDate = getActualDate()

  try {
    await connection.query('INSERT INTO users (name, surname, username, email, birthDate, password, registerDate) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, surname, username, email, birthDate, encryptedPassword, registerDate])
    const [newUser] = await connection.query('SELECT * FROM users WHERE username = ?', [username])
    return newUser[0]
  } catch (error) {
    throw new Error('Error at registering user')
  }
}

const getUserID = async (username) => {
  const [user] = await connection.query('SELECT idUser FROM users WHERE username = ?', [username])
  const idUser = user[0].idUser
  return idUser
}

const writeGeneralLog = async (idUser, table) => {
  const logDate = getActualDate()
  try {
    await connection.query(`INSERT INTO ${table} (idUser, timeStamp) VALUES (?, ?)`, [idUser, logDate])
  } catch (error) {
    throw new Error('Error at writing log')
  }
}

const loginUser = async ({ username, password }) => {
  const encryptedPassword = encrypt(password, SECRET_KEY)
  try {
    const [user] = await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, encryptedPassword])
    if (user.length === 0) {
      return false
    }
    return true
  } catch (error) {
    throw new Error('Error at login')
  }
}

const writeLoginLog = async (idUser, status, username) => {
  try {
    await connection.query('INSERT INTO loginLogs (idUser, timeStamp, status, inputusername) VALUES (?, ?, ?, ?)', [idUser, getActualDate(), status, username])
  } catch (error) {
    throw new Error('Error at writing log')
  }
}

const modifyPassword = async ({ username, oldPassword, newPassword }) => {
  oldPassword = encrypt(oldPassword, SECRET_KEY)
  newPassword = encrypt(newPassword, SECRET_KEY)

  if (!(await verifyUser(username, oldPassword))) {
    return null
  }

  try {
    await connection.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, username])
  } catch (error) {
    throw new Error('Error at modifying password')
  }
}

const modifyUsername = async ({ username, password, newUsername }) => {
  password = encrypt(password, SECRET_KEY)

  if (!(await verifyUser(username, password))) {
    return null
  }

  try {
    await connection.query('UPDATE users SET username = ? WHERE username = ?', [newUsername, username])
  } catch (error) {
    throw new Error('Error at modifying username')
  }
}

const deleteUser = async ({ username, password }) => {
  password = encrypt(password, SECRET_KEY)

  if (!(await verifyUser(username, password))) {
    return null
  }

  try {
    await connection.query('DELETE FROM users WHERE username = ?', [username])
  } catch (error) {
    throw new Error('Error at deleting user')
  }
}

const getAllUsers = async () => {
  try {
    const [users] = await connection.query('SELECT * FROM users')
    return users
  } catch (error) {
    throw new Error('Error at getting users')
  }
}

const getUserByID = async (idUser) => {
  const [user] = await connection.query('SELECT * FROM users WHERE idUser = ?', [idUser])
  return user
}

export {
  verifyUser, writeNewUser, getUserID,
  writeGeneralLog, loginUser, writeLoginLog,
  modifyPassword, modifyUsername, deleteUser,
  getAllUsers, getUserByID
}
