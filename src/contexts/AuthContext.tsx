import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import type { User } from '@/types/beluga'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(pb.authStore.token)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    if (pb.authStore.isValid && pb.authStore.record) {
      try {
        const record = await pb.collection('users').getOne<User>(pb.authStore.record.id)
        setUser(record)
        setToken(pb.authStore.token)
      } catch (_) {
        setUser(pb.authStore.record as unknown as User)
      }
    } else {
      setUser(null)
      setToken(null)
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))

    const unsubscribe = pb.authStore.onChange((newToken, record) => {
      setToken(newToken)
      setUser(record as unknown as User)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, pass: string) => {
    const authData = await pb.collection('users').authWithPassword(email, pass)
    setUser(authData.record as unknown as User)
    setToken(authData.token)
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
  }

  const isAdmin = user?.role === 'admin' || user?.email === 'belugapiscinassc@gmail.com'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
