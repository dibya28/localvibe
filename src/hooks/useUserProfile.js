import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : {})
      setLoading(false)
    })
    return unsub
  }, [uid])

  return { profile, loading }
}
