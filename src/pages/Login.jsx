import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/firebase'
import toast from 'react-hot-toast'

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success('Welcome to LocalVibe!')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Login failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
            <span className="text-white text-2xl font-black">LV</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">LocalVibe</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Your hyperlocal community board</p>
        </div>

        {/* Feature highlights */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
          {[
            ['📍', 'Discover local events & deals'],
            ['💬', 'Connect with your neighbors'],
            ['🔍', 'Find lost items & share skills'],
            ['📣', 'Post what matters to your hood'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="text-base">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-gray-400 mt-5">
          By continuing, you agree to our community guidelines
        </p>
      </div>
    </div>
  )
}
