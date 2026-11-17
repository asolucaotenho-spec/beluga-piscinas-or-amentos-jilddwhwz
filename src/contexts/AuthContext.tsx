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

// Intervalo entre renovações silenciosas do token de sessão (12h).
// O token em si dura 24h (migração 0004), então um refresh a cada 12h
// garante que o usuário nunca precise relogar enquanto usar o sistema.
const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000
// No retorno de foco/visibilidade da aba, só renova se o último refresh
// tem mais de 1h — evita requisições redundantes a cada clique.
const FOCUS_REFRESH_MIN_MS = 60 * 60 * 1000
// Retardo inicial da primeira renovação (30s após o boot), para não
// competir com o carregamento das telas.
const FIRST_REFRESH_DELAY_MS = 30 * 1000

// Marca o instante da última renovação bem ou mal sucedida (module-scope
// para sobreviver às montagens/desmontagens do StrictMode)
let lastRefreshAt = 0

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (pb.authStore.isValid && pb.authStore.record) {
      return pb.authStore.record as unknown as User
    }
    return null
  })
  const [token, setToken] = useState<string | null>(pb.authStore.token)
  const [isLoading, setIsLoading] = useState(() => {
    // Se o authStore não tem token ou não é válido, não há nada a esperar
    return false
  })

  const refreshUser = async () => {
    if (pb.authStore.isValid && pb.authStore.record) {
      try {
        const record = await pb.collection('users').getOne<User>(pb.authStore.record.id)
        setUser(record)
        setToken(pb.authStore.token)
      } catch (_) {
        // Se a chamada falhou mas o authStore tem o record em cache local, mantém
        if (pb.authStore.record) {
          setUser(pb.authStore.record as unknown as User)
        } else {
          setUser(null)
          setToken(null)
        }
      }
    } else {
      setUser(null)
      setToken(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    if (pb.authStore.isValid && pb.authStore.record) {
      // Já inicializa imediatamente com os dados locais do authStore para evitar flicker ou travamento
      setUser(pb.authStore.record as unknown as User)
      setToken(pb.authStore.token)
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }

    const unsubscribe = pb.authStore.onChange((newToken, record) => {
      if (isMounted) {
        setToken(newToken)
        setUser((record as unknown as User) || null)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  /**
   * Renovação silenciosa da sessão: mantém o token válido por tempo
   * indefinido enquanto o usuário volta ao sistema dentro da janela de
   * 24h do authToken (migração 0004). Roda em segundo plano — nunca
   * desloga por falha de rede; se o refresh expirar de verdade, o
   * authStore fica inválido e o login é pedido só na próxima navegação.
   */
  useEffect(() => {
    if (!pb.authStore.isValid) return

    let timer: ReturnType<typeof setTimeout> | null = null

    // Renova o token. Em falha de rede apenas agenda nova tentativa —
    // só limpa a sessão se o backend responder que o token expirou (400/401).
    const renew = async () => {
      if (!pb.authStore.isValid || !pb.authStore.record) return
      lastRefreshAt = Date.now()
      try {
        await pb.collection('users').authRefresh()
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status
        if (status !== 400 && status !== 401) return // falha transitória: tenta de novo depois
        // Token realmente expirado: tenta uma última vez e, persistindo, limpa
        try {
          await pb.collection('users').authRefresh()
        } catch {
          pb.authStore.clear()
        }
      }
    }

    const scheduleNext = (ms: number) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (pb.authStore.isValid) {
          renew().finally(() => scheduleNext(REFRESH_INTERVAL_MS))
        }
      }, ms)
    }

    // Primeira renovação 30s após o boot, depois a cada 12h
    scheduleNext(FIRST_REFRESH_DELAY_MS)

    // Ao voltar o foco da aba ou retomar a interação, renova se o último
    // refresh passou de 1h — cobre o caso de fechar/reabrir o app no dia seguinte
    const maybeRefreshOnFocus = () => {
      if (!pb.authStore.isValid) return
      if (Date.now() - lastRefreshAt >= FOCUS_REFRESH_MIN_MS) {
        lastRefreshAt = Date.now()
        renew()
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') maybeRefreshOnFocus()
    }

    window.addEventListener('focus', maybeRefreshOnFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('focus', maybeRefreshOnFocus)
      document.removeEventListener('visibilitychange', onVisibility)
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
