import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export function usePosts({ category = '', city = '' } = {}) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const constraints = [orderBy('createdAt', 'desc')]
    if (category) constraints.unshift(where('category', '==', category))
    if (city) constraints.unshift(where('city', '==', city))

    const q = query(collection(db, 'posts'), ...constraints)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [category, city])

  return { posts, loading, error }
}
