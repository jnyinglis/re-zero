import { useState, useEffect } from 'react'
import { AppStateProvider } from './context/AppStateContext'
import Header from './components/Header'
import IntroPage from './components/IntroPage'
import MainApp from './components/MainApp'
import Footer from './components/Footer'
import UpdateToast from './components/UpdateToast'

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  )
}

function AppContent() {
  return (
    <>
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

export default App
