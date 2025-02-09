"use client"

import { createContext, useContext, useState } from "react"

type ThemeContextType = {
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  setIsDarkMode: () => null,
})

export function EmbedThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useEmbedTheme = () => useContext(ThemeContext) 