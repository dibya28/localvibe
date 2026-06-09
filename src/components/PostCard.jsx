import { useState } from 'react'
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'
import CommentSection from './CommentSection'
import toast from 'react-hot-toast'

const CAT_DOT = {
  Events:         'bg-blue-400',
  Deals:          'bg-amber-400',
  'Lost & Found': 'bg-orange-400',
  Skills:         'bg-violet-400',
  Rants:          'bg-rose-400',
}

function timeAgo(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PostCard({ post }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [upvoting, setUpvoting] = useState(false)

  const hasUpvoted = Array.isArray(post.upvotedBy) && post.upvotedBy.includes(user?.uid)

  const handleUpvote = async () => {
    if (upvoting || !user) return
    setUpvoting(true)
    try {
      const ref = doc(db, 'posts', post.id)
      if (hasUpvoted) {
        await updateDoc(ref, { upvotes: increment(-1), upvotedBy: arrayRemove(user.uid) })
      } else {
        await updateDoc(ref, { upvotes: increment(1), upvotedBy: arrayUnion(user.uid) })
      }
    } catch {
      toast.error('Could not register vote')
    } finally {
      setUpvoting(false)
    }
  }

  return (
    <article className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center gap-2.5 mb-3">
          <img
            src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'U')}&size=32&background=f3f4f6&color=374151`}
            alt={post.authorName}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <span className="text-sm font-medium text-gray-800">{post.authorName}</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
          {post.city && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400">{post.city}</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CAT_DOT[post.category] || 'bg-gray-300'}`} />
            <span className="text-xs text-gray-400">{post.category}</span>
          </div>
        </div>

        {/* Content */}
        <h2 className="font-semibold text-gray-900 mb-1.5 leading-snug">{post.title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.body}</p>

        {/* Image */}
        {post.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="w-full max-h-64 object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex items-center gap-4 border-t border-gray-50 pt-3">
        <button
          onClick={handleUpvote}
          disabled={upvoting}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            hasUpvoted ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          {post.upvotes || 0}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            showComments ? 'text-gray-700' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.commentCount || 0} {post.commentCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 pt-4 pb-5">
          <CommentSection postId={post.id} />
        </div>
      )}
    </article>
  )
}
