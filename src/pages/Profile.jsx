import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Signed out successfully')
      navigate('/login')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown'

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover gradient */}
        <div className="h-24 bg-gradient-to-r from-green-400 to-emerald-500" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-4">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=22c55e&color=fff&size=96`}
              alt={user?.displayName}
              className="w-20 h-20 rounded-full ring-4 ring-white shadow-md object-cover"
            />
          </div>

          <h1 className="text-xl font-bold text-gray-900">{user?.displayName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Member since {memberSince}
          </div>

          <button
            onClick={handleLogout}
            className="mt-5 w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-xl transition-colors duration-200 text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
