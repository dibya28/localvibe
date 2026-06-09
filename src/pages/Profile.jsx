import { useState, useRef, useEffect } from 'react'
import { signOut, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { useNavigate } from 'react-router-dom'
import { auth, db, storage } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, dispatch } = useAuth()
  const { profile, loading } = useUserProfile(user?.uid)
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [name, setName] = useState(user?.displayName || '')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [pendingFile, setPendingFile] = useState(null)
  const [previewURL, setPreviewURL] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)

  // Populate fields once Firestore profile loads
  useEffect(() => {
    if (profile) {
      if (profile.displayName) setName(profile.displayName)
      if (profile.bio !== undefined) setBio(profile.bio)
      if (profile.city !== undefined) setCity(profile.city)
      if (profile.photoURL) setPhotoURL(profile.photoURL)
    }
  }, [profile])

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setPendingFile(file)
    setPreviewURL(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)

    try {
      let finalPhotoURL = photoURL

      // Upload new photo if selected
      if (pendingFile) {
        const storageRef = ref(storage, `avatars/${user.uid}/profile`)
        const task = uploadBytesResumable(storageRef, pendingFile)
        finalPhotoURL = await new Promise((resolve, reject) => {
          task.on(
            'state_changed',
            (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
            reject,
            async () => resolve(await getDownloadURL(task.snapshot.ref))
          )
        })
        setPendingFile(null)
        setPreviewURL(null)
        setPhotoURL(finalPhotoURL)
        setUploadProgress(0)
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
        photoURL: finalPhotoURL,
      })

      // Persist extra fields to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name.trim(),
        photoURL: finalPhotoURL,
        bio: bio.trim(),
        city: city.trim(),
        email: user.email,
        updatedAt: new Date(),
      }, { merge: true })

      // Refresh auth context with updated user
      dispatch({ type: 'LOGIN', payload: { ...auth.currentUser } })

      toast.success('Profile updated')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const currentPhoto = previewURL || photoURL

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-base font-semibold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">

        {/* Photo section */}
        <div className="px-5 py-5 flex items-center gap-5">
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-gray-100 cursor-pointer group"
              onClick={() => fileRef.current.click()}
            >
              <img
                src={currentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&size=64&background=f3f4f6&color=374151`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {/* Camera overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
            </div>

            {/* Upload progress ring */}
            {saving && uploadProgress > 0 && uploadProgress < 100 && (
              <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="30" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                <circle
                  cx="32" cy="32" r="30" fill="none" stroke="#16a34a" strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - uploadProgress / 100)}`}
                  className="transition-all duration-200"
                />
              </svg>
            )}
          </div>

          <div>
            <button
              onClick={() => fileRef.current.click()}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Change photo
            </button>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF · max 5 MB</p>
            {pendingFile && (
              <p className="text-xs text-green-600 mt-0.5">New photo ready — click Save to apply</p>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* Display name */}
        <div className="px-5 py-4">
          <label className="block text-xs text-gray-400 mb-1.5">Display name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="Your name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-300"
          />
        </div>

        {/* Bio */}
        <div className="px-5 py-4">
          <label className="block text-xs text-gray-400 mb-1.5">
            Bio <span className="text-gray-300">({bio.length}/160)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            placeholder="Tell your community a little about yourself…"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-300"
          />
        </div>

        {/* City */}
        <div className="px-5 py-4">
          <label className="block text-xs text-gray-400 mb-1.5">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-300"
          />
        </div>

        {/* Email (read-only) */}
        <div className="px-5 py-4">
          <label className="block text-xs text-gray-400 mb-1.5">Email</label>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>

        {/* Member since */}
        {memberSince && (
          <div className="px-5 py-3">
            <p className="text-xs text-gray-300">Member since {memberSince}</p>
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="mt-3 w-full py-2.5 text-sm font-medium bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-colors"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="mt-2 w-full py-2.5 text-sm text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-100 rounded-xl bg-white transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
