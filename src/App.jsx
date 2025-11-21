import { useState, useEffect } from 'react'
import { AppStateProvider, useAppState } from './context/AppStateContext'
import Header from './components/Header'
import IntroPage from './components/IntroPage'
import MainApp from './components/MainApp'
import Footer from './components/Footer'
import UpdateToast from './components/UpdateToast'
import MobileMenu from './components/MobileMenu'

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  )
}

function AppContent() {
  const [theme, setTheme] = useState('auto')

  return (
    <>
      <ThemeProvider theme={theme} setTheme={setTheme} />
      <MobileMenu />
      <Header />
      <main className="app">
        <IntroPage />
        <MainApp />
      </main>
      <Footer />
      <UpdateToast />
    </>
  )
}

function ThemeProvider({ theme, setTheme }) {
  const { state } = useAppState()

  useEffect(() => {
    const newTheme = state.settings.theme || 'auto'
    setTheme(newTheme)

    // Apply theme to document
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [state.settings.theme, setTheme])

  return null
}

export default App
