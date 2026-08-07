import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import PricingSection from './components/PricingSection'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal/LoginModal'
import DashboardShell from './components/Dashboard/DashboardShell'
import { useAuth } from './context/AuthContext'

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginError, setLoginError] = useState('')
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.15 }
    )

    document.querySelectorAll('.fade-in-section').forEach((element) => observer.observe(element))

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  const handleLogin = async (username, password) => {
    const response = await login(username, password)

    if (!response.success) {
      setLoginError(response.message)
      return
    }

    setIsLoginOpen(false)
    setLoginError('')
    navigate('/dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <div className='min-h-screen bg-slate-950 text-slate-900 selection:bg-orange-500 selection:text-white'>
        <Navbar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          scrolled={scrolled}
          user={user}
          onLoginClick={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
        />

        <main id='home'>
          <HeroSection />
          <FeaturesSection />
          <PricingSection />
          <AboutSection />
        </main>

        <Footer />
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false)
          setLoginError('')
        }}
        onSubmit={handleLogin}
        error={loginError}
      />
    </>
  )
}

const ProtectedDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to='/' replace state={{ from: location }} />
  }

  return <DashboardShell />
}

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/dashboard/*' element={<ProtectedDashboard />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App