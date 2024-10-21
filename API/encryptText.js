import crypto from 'crypto'

// Function to encrypt the text
export function encrypt (text, secretKey) {
  const iv = Buffer.alloc(16, 0) // Use a fixed IV (all zeros) for idempotence
  const key = crypto.createHash('sha256').update(secretKey).digest() // Derive key from the secret key
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv) // Create cipher with AES-256-CBC

  let encrypted = cipher.update(text, 'utf-8', 'hex') // Encrypt text
  encrypted += cipher.final('hex') // Finalize encryption

  return encrypted // Return the encrypted text
}

// Function to decrypt the text
export function decrypt (encryptedText, secretKey) {
  const iv = Buffer.alloc(16, 0) // Use the same fixed IV for decryption
  const key = crypto.createHash('sha256').update(secretKey).digest() // Derive key from the secret key

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv) // Create decipher with AES-256-CBC

  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8') // Decrypt text
  decrypted += decipher.final('utf-8') // Finalize decryption

  return decrypted
}
