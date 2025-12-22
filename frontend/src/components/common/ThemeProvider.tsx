import { useEffect } from 'react'
import { useTheme } from '../../hooks/useTheme'

/**
 * Theme Provider - Initializes theme on app load
 * Must be rendered at the root level to ensure theme is applied immediately
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme()

  useEffect(() => {
    // Ensure theme is applied immediately
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
}

