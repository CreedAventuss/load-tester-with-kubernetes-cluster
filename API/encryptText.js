import bcrypt from 'bcrypt'

// Function to encrypt the text
export async function encrypt (text) {
  const SALT = 10
  const hashedPassword = await bcrypt.hash(text, SALT)

  return hashedPassword
}
