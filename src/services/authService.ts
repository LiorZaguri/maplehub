// Secure auth service that doesn't expose API keys
export class AuthService {
  private static readonly SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'

  static async signUp(email: string, password: string, options?: any) {
    const response = await fetch(`${this.SUPABASE_URL}/functions/v1/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signUp',
        email,
        password,
        options
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Sign up failed')
    }

    return response.json()
  }

  static async signIn(email: string, password: string) {
    const response = await fetch(`${this.SUPABASE_URL}/functions/v1/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signIn',
        email,
        password
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Sign in failed')
    }

    return response.json()
  }

  static async signOut() {
    const response = await fetch(`${this.SUPABASE_URL}/functions/v1/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signOut'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Sign out failed')
    }

    return response.json()
  }

  static async getUser() {
    const response = await fetch(`${this.SUPABASE_URL}/functions/v1/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getUser'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Get user failed')
    }

    return response.json()
  }

  static async resetPassword(email: string, options?: any) {
    const response = await fetch(`${this.SUPABASE_URL}/functions/v1/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'resetPassword',
        email,
        options
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Reset password failed')
    }

    return response.json()
  }
}
