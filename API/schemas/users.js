import { z } from 'zod'

const emailSchema = z.string().regex(
  /^[a-zA-Z0-9._%+-ñÑ]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/,
  {
    message: 'Invalid email address',
    required_error: 'Email is required'
  }
)

const userSchema = z.object({
  name: z.string({
    invalid_type_error: 'Name must be a string',
    required_error: 'Name is required'
  }).min(2, { message: 'Minimum of 2 characters' }).max(15, { message: 'Maximum of 15 characters' }),

  surname: z.string({
    invalid_type_error: 'Surname must be a string',
    required_error: 'Surname is required'
  }).min(2, { message: 'Minimum of 2 characters' }).max(15, { message: 'Maximum of 15 characters' }),

  username: z.string({
    invalid_type_error: 'Username must be a string',
    required_error: 'Username is required'
  }).min(4, { message: 'Minimum of 4 characters' }).max(25, { message: 'Maximum of 25 characters' }),

  email: emailSchema,

  birthDate: z.string({
    invalid_type_error: 'Birthdate must be a date with format YYYY-MM-DD',
    required_error: 'Birthdate is required with format YYYY-MM-DD'
  }).date(),

  password: z.string({
    invalid_type_error: 'Password must be a string',
    required_error: 'Password is required'
  }).min(8, { message: 'Minimum of 8 characters' })
})

export function validateUser (object) {
  if (object.birthdate) {
    object.birthdate = new Date(object.birthdate)
  }

  return userSchema.safeParse(object)
}

// Para validar un objeto parcial, todos los campos deben ser opcionales.
export function validatePartialUser (object) {
  if (object.birthdate) {
    object.birthdate = new Date(object.birthdate)
  }

  return userSchema.partial().safeParse(object)
}
