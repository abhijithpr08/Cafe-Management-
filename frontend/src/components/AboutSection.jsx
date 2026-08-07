const AboutSection = () => {
  return (
    <section id='about' className='bg-white px-4 py-20 sm:px-6 lg:px-8'>
      <div className='mx-auto grid max-w-7xl gap-10 rounded-[2rem] bg-slate-900 px-6 py-12 text-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr] lg:px-10'>
        <div className='fade-in-section'>
          <p className='mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-orange-400'>About RestroPOS</p>
          <h2 className='text-3xl font-bold sm:text-4xl'>Designed for restaurant owners who want clarity, speed, and control.</h2>
          <p className='mt-4 max-w-2xl text-lg leading-8 text-slate-300'>From quick-service cafés to multi-branch fine dining, our POS platform combines elegant billing with smart operations in one dashboard.</p>
        </div>
        <div className='fade-in-section rounded-3xl border border-white/10 bg-white/10 p-6'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='rounded-2xl bg-white/10 p-4'>
              <div className='text-3xl font-black'>24/7</div>
              <div className='mt-2 text-sm text-slate-300'>Cloud access from anywhere</div>
            </div>
            <div className='rounded-2xl bg-white/10 p-4'>
              <div className='text-3xl font-black'>99.9%</div>
              <div className='mt-2 text-sm text-slate-300'>Reliable uptime for peak service</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
