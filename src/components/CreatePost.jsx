import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const CATEGORIES = ['Events', 'Deals', 'Lost & Found', 'Skills', 'Rants']

const CAT_ICONS = {
  Events: '📅',
  Deals: '🏷️',
  'Lost & Found': '🔍',
  Skills: '💡',
  Rants: '😤',
}

export default function CreatePost({ onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', body: '', category: 'Events', city: '' })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    setUploadProgress(0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.body.trim()) { toast.error('Body is required'); return }

    setSubmitting(true)

    try {
      let imageUrl = null

      if (image) {
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${image.name}`)
        const task = uploadBytesResumable(storageRef, image)

        imageUrl = await new Promise((resolve, reject) => {
          task.on(
            'state_changed',
            (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
            reject,
            async () => resolve(await getDownloadURL(task.snapshot.ref))
          )
        })
      }

      await addDoc(collection(db, 'posts'), {
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        city: form.city.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        upvotes: 0,
        upvotedBy: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      })

      toast.success('Posted to your community!')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <img
          src={user?.photoURL}
          alt={user?.displayName}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{user?.displayName}</p>
          <p className="text-xs text-gray-400">Share with your community</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Category + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Category
            </label>
            <select
              value={form.category}
              onChange={set('category')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CAT_ICONS[c]} {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              City <span className="text-gray-300 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.city}
              onChange={set('city')}
              placeholder="e.g. Mumbai"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder="What's happening?"
            maxLength={100}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder:text-gray-300"
          />
          <p className="text-right text-xs text-gray-300 mt-0.5">{form.title.length}/100</p>
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Details
          </label>
          <textarea
            value={form.body}
            onChange={set('body')}
            placeholder="Share more details with your community…"
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder:text-gray-300"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Image <span className="text-gray-300 normal-case font-normal">(optional · max 5 MB)</span>
          </label>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-100">
              <img src={preview} alt="Preview" className="w-full max-h-52 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-sm transition-colors"
              >
                ×
              </button>
              {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                  <div
                    className="h-full bg-green-400 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/40 transition-all">
              <span className="text-2xl">📷</span>
              <span className="text-xs text-gray-400 mt-1">Click to upload</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-semibold rounded-xl transition-colors duration-200 shadow-sm shadow-green-200"
          >
            {submitting ? 'Posting…' : 'Post to Community'}
          </button>
        </div>
      </form>
    </div>
  )
}
