import bcrypt from 'bcryptjs'

export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long' }
    }

    if (password.length > 128) {
      return { valid: false, message: 'Password must be less than 128 characters' }
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    // const _hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password) // Unused variable

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        valid: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }
    }

    return { valid: true }
  }
}