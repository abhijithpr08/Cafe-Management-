import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import PricingSection from './components/PricingSection'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  return (
    <div className='min-h-screen bg-slate-950 text-slate-900 selection:bg-orange-500 selection:text-white'>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} scrolled={scrolled} />

      <main id='home'>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <AboutSection />
      </main>

      <Footer />
    </div>
  )
}

export default App