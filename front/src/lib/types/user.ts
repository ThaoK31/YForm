// Types liés aux utilisateurs
export interface User {
  user_id: string
  name: string
  email: string
  image?: string
}

// Types liés à l'authentification
export interface AuthResponse {
  user: User
  token: string     // JWT token pour l'authentification
}

// Types pour la création/mise à jour d'utilisateur
export interface CreateUserData {
  name: string
  email: string
  password: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
}
