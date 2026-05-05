import { createContext, useContext, useEffect, useState } from 'react'
import { getOrCreateUser } from '../services/user'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrCreateUser()
      .then(setUser)
      .catch((err) => {
        // Supabase niet geconfigureerd — log voor dev, ga door voor gebruiker
        console.warn('[UserContext] Supabase niet bereikbaar:', err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
