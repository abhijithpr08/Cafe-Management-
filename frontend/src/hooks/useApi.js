import { useEffect, useMemo, useState } from 'react'

const useApi = (requestFn, deps = []) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useMemo(() => requestFn, deps)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchData()

        if (isMounted) {
          setData(response)
        }
      } catch (err) {
        if (isMounted) {
          setError(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [fetchData])

  return { data, loading, error, setData }
}

export default useApi
