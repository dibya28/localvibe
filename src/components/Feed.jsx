import { usePosts } from '../hooks/usePosts'
import PostCard from './PostCard'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-200 rounded-md w-32 mb-1.5" />
          <div className="h-3 bg-gray-100 rounded-md w-24" />
        </div>
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2" />
      <div className="space-y-1.5">
        <div className="h-3.5 bg-gray-100 rounded-md w-full" />
        <div className="h-3.5 bg-gray-100 rounded-md w-5/6" />
        <div className="h-3.5 bg-gray-100 rounded-md w-4/6" />
      </div>
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
        <div className="h-8 bg-gray-100 rounded-lg w-16" />
        <div className="h-8 bg-gray-100 rounded-lg w-24" />
      </div>
    </div>
  )
}

export default function Feed({ category, city }) {
  const { posts, loading, error } = usePosts({ category, city })

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-red-100 shadow-sm">
        <div className="text-3xl mb-3">⚠️</div>
        <p className="font-semibold text-gray-700">Failed to load posts</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
        <p className="text-xs text-gray-300 mt-2">
          If this persists, check your Firestore index configuration.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="text-5xl mb-3">🏘️</div>
        <h3 className="font-semibold text-gray-700">No posts here yet</h3>
        <p className="text-sm text-gray-400 mt-1">
          {category || city
            ? 'Try removing filters to see more posts.'
            : 'Be the first to post in your community!'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
