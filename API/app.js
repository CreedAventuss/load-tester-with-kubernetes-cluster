// Main function to create the app

import express, { json } from 'express'
import cors from 'cors'
import { createUsersRouter } from './routes/users-router.js'

// Model is passed as a parameter to the app
export const createApp = ({ userModel }) => {
  const app = express()

  app.use(cors())
  app.use(json()) // Accept JSON in the body of the request

  const PORT = process.env.PORT || 3000

  // Use the users router to recieve requests in /users
  app.use('/users', createUsersRouter({ userModel }))

  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`)
  })
}
