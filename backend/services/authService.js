import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// In-memory user store (no DB needed for hackathon demo)
const users = new Map()

const JWT_SECRET = process.env.JWT_SECRET || 'careerpilot_secret_2026'

export async function registerUser(email, password, name) {
  if (users.has(email)) {
    throw new Error('Email already registered')
  }
  const hashed = await bcrypt.hash(password, 10)
  users.set(email, { email, password: hashed, name, createdAt: Date.now() })
  return { message: 'Account created successfully!' }
}

export async function loginUser(email, password) {
  const user = users.get(email)
  if (!user) throw new Error('No account found with this email')

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error('Incorrect password')

  const token = jwt.sign(
    { email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  return { token, user: { email: user.email, name: user.name } }
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}
