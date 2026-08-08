import { useEffect, useMemo, useState } from 'react'

/** Fallback when item.image is missing or fails to load */
const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'

/** Indian menu veg / non-veg square indicator */
const VegIndicator = ({ veg }) => (
  <span
    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border-2 ${
      veg ? 'border-emerald-600' : 'border-red-800'
    }`}
    title={veg ? 'Vegetarian' : 'Non-Vegetarian'}
    aria-label={veg ? 'Vegetarian' : 'Non-Vegetarian'}
  >
    <span className={`h-2 w-2 ${veg ? 'bg-emerald-600' : 'bg-red-800'}`} />
  </span>
)

/** Loading skeleton cards while API data fetches */
const MenuSkeleton = () => (
  <div className='mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
      >
        <div className='h-40 animate-pulse bg-slate-200' />
        <div className='space-y-3 p-4'>
          <div className='h-4 w-3/4 animate-pulse rounded bg-slate-200' />
          <div className='h-3 w-full animate-pulse rounded bg-slate-100' />
          <div className='h-3 w-1/2 animate-pulse rounded bg-slate-100' />
          <div className='h-10 w-full animate-pulse rounded-xl bg-slate-200' />
        </div>
      </div>
    ))}
  </div>
)

const MenuItemCard = ({ item, onAdd, showAddButton = false, animationDelay = 0 }) => {
  const unavailable = item.available === false
  const [imgSrc, setImgSrc] = useState(item.image || PLACEHOLDER_IMAGE)

  useEffect(() => {
    setImgSrc(item.image || PLACEHOLDER_IMAGE)
  }, [item.image])

  return (
    <article
      className={`menu-card fade-in-section flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        unavailable
          ? 'border-slate-200 opacity-55 grayscale'
          : 'border-slate-200 hover:border-orange-200'
      }`}
      style={{ transitionDelay: `${animationDelay}ms` }}
    >
      {/* Image */}
      <div className='relative h-40 overflow-hidden bg-slate-100'>
        <img
          src={imgSrc}
          alt={item.name}
          className='h-full w-full object-cover'
          loading='lazy'
          onError={() => {
            if (imgSrc !== PLACEHOLDER_IMAGE) setImgSrc(PLACEHOLDER_IMAGE)
          }}
        />

        {/* Veg / Non-veg indicator — top-left (Indian menu convention) */}
        <div className='absolute left-3 top-3 rounded bg-white/95 p-1 shadow-sm'>
          <VegIndicator veg={!!item.veg} />
        </div>

        {/* Availability badge */}
        <span
          className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            unavailable ? 'bg-slate-600 text-white' : 'bg-emerald-500 text-white'
          }`}
        >
          {unavailable ? 'Out of Stock' : 'Available'}
        </span>
      </div>

      <div className='flex flex-1 flex-col p-4'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='text-base font-bold text-slate-900'>{item.name}</h3>
          <p className='shrink-0 text-base font-bold text-orange-600'>₹{item.price}</p>
        </div>

        {item.description ? (
          <p className='mt-1 line-clamp-2 text-sm text-slate-500'>{item.description}</p>
        ) : null}

        <p className='mt-1 text-xs text-slate-400'>{item.category}</p>

        {/* Add to Cart — hidden/disabled when out of stock */}
        {showAddButton && (
          <div className='mt-auto pt-4'>
            {unavailable ? (
              <button
                type='button'
                disabled
                className='w-full cursor-not-allowed rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-400'
              >
                Out of Stock
              </button>
            ) : (
              <button
                type='button'
                onClick={() => onAdd?.(item)}
                className='w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98]'
              >
                Add to Cart
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

/**
 * Shared digital menu UI — used on landing page and QR order page.
 * Expects items/categories already fetched via apiClient (GET /menu, GET /categories).
 */
const MenuSection = ({
  items = [],
  categories = [],
  showAddButton = false,
  onAddToCart,
  loading = false,
  error = '',
  title = 'Our Menu',
  subtitle = 'Freshly prepared dishes from our kitchen',
}) => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  // Prefer API categories order; fall back to categories present on items
  const categoryNames = useMemo(() => {
    const fromApi = categories
      .map((c) => (typeof c === 'string' ? c : c.name))
      .filter(Boolean)
    if (fromApi.length) return fromApi
    return [...new Set(items.map((i) => i.category).filter(Boolean))]
  }, [categories, items])

  // Client-side filter: category tab + name search
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const matchesSearch = !query || item.name.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [items, activeCategory, search])

  // Scroll-in fade animation for cards
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('.menu-card'))
    const revealElement = (element) => {
      if (element) element.classList.add('is-visible')
    }

    const revealVisibleCards = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const isInViewport = rect.top < viewportHeight * 1.2 && rect.bottom > 0
        if (isInViewport) revealElement(card)
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

      cards.forEach((card) => observer.observe(card))
      revealVisibleCards()
    } else {
      cards.forEach(revealElement)
    }

    fallbackTimeout = window.setTimeout(() => {
      cards.forEach((card) => revealElement(card))
    }, 1500)

    return () => {
      if (observer) observer.disconnect()
      if (fallbackTimeout) window.clearTimeout(fallbackTimeout)
    }
  }, [filteredItems, loading])

  return (
    <section id='menu' className='fade-in-section bg-gradient-to-b from-slate-50 to-white py-20 text-slate-900'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <p className='text-sm font-semibold uppercase tracking-widest text-orange-500'>Digital Menu</p>
          <h2 className='mt-2 text-3xl font-black sm:text-4xl'>{title}</h2>
          <p className='mx-auto mt-3 max-w-2xl text-slate-500'>{subtitle}</p>
        </div>

        {/* Search */}
        <div className='mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative max-w-md flex-1'>
            <input
              type='search'
              placeholder='Search dishes by name...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
              aria-label='Search menu items'
            />
            <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' aria-hidden>
              🔍
            </span>
          </div>
        </div>

        {/* Category tabs — dynamically from API */}
        <div className='mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
          <button
            type='button'
            onClick={() => setActiveCategory('All')}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === 'All'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-300'
            }`}
          >
            All
          </button>
          {categoryNames.map((cat) => (
            <button
              key={cat}
              type='button'
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <MenuSkeleton />}

        {error && !loading && (
          <div className='mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-600'>
            {error}
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className='mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
            {filteredItems.map((item, index) => (
              <MenuItemCard
                key={item._id || `${item.name}-${index}`}
                item={item}
                showAddButton={showAddButton}
                onAdd={onAddToCart}
                animationDelay={Math.min(index * 40, 400)}
              />
            ))}
          </div>
        )}

        {/* Empty state for category / search */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className='mt-12 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center'>
            <p className='text-lg font-semibold text-slate-700'>No items found</p>
            <p className='mt-2 text-sm text-slate-500'>
              {search
                ? `No dishes match “${search}”. Try another name.`
                : activeCategory === 'All'
                  ? 'The menu is empty right now. Please check back soon.'
                  : `No dishes in “${activeCategory}” yet. Try another category.`}
            </p>
            {(search || activeCategory !== 'All') && (
              <button
                type='button'
                onClick={() => {
                  setSearch('')
                  setActiveCategory('All')
                }}
                className='mt-4 text-sm font-semibold text-orange-600 hover:underline'
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default MenuSection
