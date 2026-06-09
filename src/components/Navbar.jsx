import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-black">LV</span>
          </div>
          <span className="font-black text-gray-900 text-lg tracking-tight">LocalVibe</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to="/"
            className={`text-sm font-semibold transition-colors ${
              location.pathname === '/' ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Feed
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 group"
            title={user.displayName}
          >
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=22c55e&color=fff`}
              alt={user.displayName}
              className="w-8 h-8 rounded-full ring-2 ring-gray-100 group-hover:ring-green-300 transition-all object-cover"
            />
          </Link>
        </div>
      </div>
    </nav>
  )
}
