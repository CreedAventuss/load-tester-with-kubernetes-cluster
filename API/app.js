import express, { json } from 'express'
import cors from 'cors'
import { createUsersRouter } from './routes/users.js'

export const createApp = ({ userModel }) => {
  const app = express()
  app.use(cors())
  app.use(json())

  const PORT = process.env.PORT || 3000

  app.use('/users', createUsersRouter({ userModel }))

  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`)
  })
}
