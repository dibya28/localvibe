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
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function avatarFallback(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=22c55e&color=fff&size=32`
}

function CommentSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 bg-white border border-gray-100 rounded-xl p-2.5">
        <div className="h-3 bg-gray-200 rounded w-24 mb-1.5" />
        <div className="h-2.5 bg-gray-100 rounded w-full" />
        <div className="h-2.5 bg-gray-100 rounded w-4/5 mt-1" />
      </div>
    </div>
  )
}

export default function CommentSection({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
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
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1),
      })
      setText('')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Comment list */}
      {loading ? (
        <div className="space-y-3 mb-4">
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 py-1 mb-3">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-2.5 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 animate-fade-in">
              <img
                src={c.authorPhoto || avatarFallback(c.authorName)}
                alt={c.authorName}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="bg-white rounded-xl px-3 py-2 flex-1 border border-gray-100 shadow-sm">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-800">{c.authorName}</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <img
          src={user?.photoURL || avatarFallback(user?.displayName)}
          alt={user?.displayName}
          className="w-7 h-7 rounded-full object-cover shrink-0"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          maxLength={1000}
          className="flex-1 text-sm border border-gray-200 bg-white rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-200 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shrink-0"
        >
          {submitting ? '…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
