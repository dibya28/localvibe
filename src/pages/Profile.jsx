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
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-base font-semibold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.photoURL}
            alt={user?.displayName}
            className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-100"
          />
          <div>
            <p className="font-medium text-gray-900">{user?.displayName}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {memberSince && (
          <p className="text-xs text-gray-300 mt-5 pt-5 border-t border-gray-50">
            Member since {memberSince}
          </p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-3 w-full py-2.5 text-sm text-gray-500 hover:text-red-500 border border-gray-100 hover:border-red-100 rounded-xl bg-white transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
