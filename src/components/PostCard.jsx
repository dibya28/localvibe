import { useState } from 'react'
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'
import CommentSection from './CommentSection'
import toast from 'react-hot-toast'

const CATEGORY_STYLES = {
  Events:        { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: '📅' },
  Deals:         { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🏷️' },
  'Lost & Found':{ bg: 'bg-orange-100', text: 'text-orange-700', icon: '🔍' },
  Skills:        { bg: 'bg-purple-100', text: 'text-purple-700', icon: '💡' },
  Rants:         { bg: 'bg-red-100',    text: 'text-red-700',    icon: '😤' },
}

function timeAgo(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function avatarFallback(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=22c55e&color=fff&size=40`
}

export default function PostCard({ post }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [upvoting, setUpvoting] = useState(false)

  const hasUpvoted = Array.isArray(post.upvotedBy) && post.upvotedBy.includes(user?.uid)
  const catStyle = CATEGORY_STYLES[post.category] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: '📌' }

  const handleUpvote = async () => {
    if (upvoting || !user) return
    setUpvoting(true)
    try {
      const ref = doc(db, 'posts', post.id)
      if (hasUpvoted) {
        await updateDoc(ref, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(user.uid),
        })
      } else {
        await updateDoc(ref, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(user.uid),
        })
      }
    } catch {
      toast.error('Could not register your vote')
    } finally {
      setUpvoting(false)
    }
  }

  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-start gap-3 mb-3">
          <img
            src={post.authorPhoto || avatarFallback(post.authorName)}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {post.authorName}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5 flex-wrap">
              <span>{timeAgo(post.createdAt)}</span>
              {post.city && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {post.city}
                  </span>
                </>
              )}
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${catStyle.bg} ${catStyle.text}`}>
            <span>{catStyle.icon}</span>
            {post.category}
          </span>
        </div>

        {/* Title & body */}
        <h2 className="font-bold text-gray-900 mb-1.5 leading-snug">{post.title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{post.body}</p>

        {/* Image */}
        {post.imageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="w-full max-h-72 object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-5 pb-4 pt-2 border-t border-gray-50 flex items-center gap-2">
        <button
          onClick={handleUpvote}
          disabled={upvoting}
          aria-label={hasUpvoted ? 'Remove upvote' : 'Upvote post'}
          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 ${
            hasUpvoted
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-600'
          } disabled:opacity-50`}
        >
          <svg className="w-4 h-4" fill={hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          {post.upvotes || 0}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 ${
            showComments
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.commentCount || 0} {post.commentCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-100 px-5 pt-4 pb-5 bg-gray-50/60 animate-fade-in">
          <CommentSection postId={post.id} />
        </div>
      )}
    </article>
  )
}
