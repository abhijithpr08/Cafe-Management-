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
import LandingMenuSection from './components/Menu/LandingMenuSection'
import CustomerOrderPage from './components/CustomerOrder/CustomerOrderPage'
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

    const elements = Array.from(document.querySelectorAll('.fade-in-section'))
    const revealElement = (element) => {
      if (element) element.classList.add('is-visible')
    }

    const revealVisibleElements = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const isInViewport = rect.top < viewportHeight * 1.2 && rect.bottom > 0
        if (isInViewport) revealElement(element)
      })
    }

    let observer = null
    let fallbackTimeout = null

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) revealElement(entry.target)
          })
        },
        {
          root: null,
          threshold: 0.1,
          rootMargin: '0px 0px -12% 0px',
        }
      )

      elements.forEach((element) => observer.observe(element))
      revealVisibleElements()
    } else {
      elements.forEach(revealElement)
    }

    fallbackTimeout = window.setTimeout(() => {
      elements.forEach((element) => revealElement(element))
    }, 1500)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (observer) observer.disconnect()
      if (fallbackTimeout) window.clearTimeout(fallbackTimeout)
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
          <LandingMenuSection />
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
      <Route path='/order' element={<CustomerOrderPage />} />
      <Route path='/dashboard/*' element={<ProtectedDashboard />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App