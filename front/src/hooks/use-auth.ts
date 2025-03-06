"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { User } from "@/lib/types/user"
import { toast } from "@/hooks/use-toast"
import Cookies from 'js-cookie'
import { create } from 'zustand'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface LoginData {
  email: string
  password: string
}

interface RegisterData extends LoginData {
  name: string
}

const formatUser = (user: any): User => ({
  ...user,
  id: user.id || user._id,
})

interface ServerUser extends Omit<User, 'id'> {
  _id?: string
  id?: string
}

interface AuthResponse {
  user: ServerUser
  token: string
}

type AuthStore = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  signOut: () => Promise<void>
  signIn: (data: LoginData) => Promise<void>
  signUp: (data: RegisterData) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        set({ user: null, isLoading: false })
        return
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (response.ok) {
        const { user } = await response.json()
        set({ user: formatUser(user), isLoading: false })
      } else {
        Cookies.remove('token')
        set({ user: null, isLoading: false })
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth:', error)
      Cookies.remove('token')
      set({ user: null, isLoading: false })
    }
  },

  signIn: async (data) => {
    const { setUser, setLoading } = get()
    try {
      setLoading(true)
      setUser(null)
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Identifiants invalides')
      }

      const { user, token }: AuthResponse = await response.json()
      
      Cookies.set('token', token, { 
        expires: 7,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      })
      
      setUser(formatUser(user))
      toast({
        title: "Succès",
        description: 'Connexion réussie'
      })
    } catch (error) {
      setUser(null)
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message
        })
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: 'Erreur lors de la connexion'
        })
      }
      throw error
    } finally {
      setLoading(false)
    }
  },

  signUp: async (data) => {
    const { setUser, setLoading } = get()
    try {
      setLoading(true)
      setUser(null)
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'inscription')
      }

      const { user, token }: AuthResponse = await response.json()
      
      Cookies.set('token', token, { 
        expires: 7,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      })

      setUser(formatUser(user))
      toast({
        title: "Succès",
        description: 'Inscription réussie'
      })
    } catch (error) {
      setUser(null)
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message
        })
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: 'Erreur lors de l\'inscription'
        })
      }
      throw error
    } finally {
      setLoading(false)
    }
  },

  signOut: async () => {
    const { setUser, setLoading } = get()
    try {
      setLoading(true)
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: 'Erreur lors de la déconnexion'
      })
    } finally {
      Cookies.remove('token')
      setUser(null)
      setLoading(false)
      toast({
        title: "Succès",
        description: 'Déconnexion réussie'
      })
    }
  }
}))

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    store.initialize()
  }, [])

  const handleSignIn = async (data: LoginData) => {
    await store.signIn(data)
    router.push('/dashboard')
  }

  const handleSignUp = async (data: RegisterData) => {
    await store.signUp(data)
    router.push('/dashboard')
  }

  const handleSignOut = async () => {
    await store.signOut()
    router.push('/login')
  }

  return {
    user: store.user,
    isLoading: store.isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  }
} 