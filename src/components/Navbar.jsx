import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900 tracking-tight text-sm">
          Stackup
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm transition-colors ${
              location.pathname === '/'
                ? 'text-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Feed
          </Link>
          <Link to="/profile">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
            />
          </Link>
        </div>
      </div>
    </nav>
  )
}
