// Root entry point for the server with MySQL

import { createApp } from './app.js'
import { UserModel } from './models/mysql/users-mysql-model.js'

// Call createApp with the user model chosen
createApp({ userModel: UserModel })
