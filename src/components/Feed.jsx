import { usePosts } from '../hooks/usePosts'
import PostCard from './PostCard'

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1">
          <div className="h-3 bg-gray-100 rounded w-28 mb-1.5" />
          <div className="h-2.5 bg-gray-50 rounded w-20" />
        </div>
        <div className="h-4 bg-gray-50 rounded w-16" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-2/3 mb-2.5" />
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-50 rounded w-full" />
        <div className="h-3 bg-gray-50 rounded w-5/6" />
      </div>
      <div className="flex gap-4 mt-5 pt-4 border-t border-gray-50">
        <div className="h-6 bg-gray-50 rounded w-12" />
        <div className="h-6 bg-gray-50 rounded w-20" />
      </div>
    </div>
  )
}

export default function Feed({ category, city }) {
  const { posts, loading, error } = usePosts({ category, city })

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-5 py-10 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">Failed to load posts</p>
        <p className="text-xs text-gray-400">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-5 py-14 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">No posts yet</p>
        <p className="text-xs text-gray-400">
          {category || city ? 'Try removing your filters.' : 'Be the first to post.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
