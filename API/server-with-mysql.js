import { createApp } from './app.js'
import { UserModel } from './models/mysql/user.js'

createApp({ userModel: UserModel })
