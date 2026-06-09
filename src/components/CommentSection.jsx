import { useState, useEffect } from 'react'
import {
  collection, addDoc, query, orderBy,
  onSnapshot, serverTimestamp, doc, updateDoc, increment,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

function timeAgo(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CommentSection({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [postId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || submitting) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        body,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) })
      setText('')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {loading ? (
        <div className="space-y-2.5 mb-3 animate-pulse">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 bg-white border border-gray-100 rounded-lg p-2.5">
                <div className="h-2.5 bg-gray-100 rounded w-24 mb-1.5" />
                <div className="h-2.5 bg-gray-50 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-300 mb-3">No comments yet.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <img
                src={c.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName || 'U')}&size=24&background=f3f4f6&color=374151`}
                alt={c.authorName}
                className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 flex-1">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-medium text-gray-700">{c.authorName}</span>
                  <span className="text-xs text-gray-300">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <img
          src={user?.photoURL}
          alt={user?.displayName}
          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          maxLength={1000}
          className="flex-1 text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="text-xs font-medium px-3 py-1.5 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
