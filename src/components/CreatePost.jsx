import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const CATEGORIES = ['Events', 'Deals', 'Lost & Found', 'Skills', 'Rants']

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
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setImage(file)
    setPreview(URL.createObjectURL(file))
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

      toast.success('Post created')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 placeholder:text-gray-300 transition-colors"

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900">New post</span>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-gray-600 transition-colors text-lg leading-none w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={set('category')}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">City <span className="text-gray-300">(optional)</span></label>
            <input
              type="text"
              value={form.city}
              onChange={set('city')}
              placeholder="e.g. Mumbai"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder="What's happening?"
            maxLength={100}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Details</label>
          <textarea
            value={form.body}
            onChange={set('body')}
            placeholder="Share more with your community…"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Image <span className="text-gray-300">(optional · max 5 MB)</span></label>
          {preview ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-100">
              <img src={preview} alt="Preview" className="w-full max-h-48 object-cover" />
              <button
                type="button"
                onClick={() => { setImage(null); setPreview(null) }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xs transition-colors"
              >
                ×
              </button>
              {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-200">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          ) : (
            <label className="flex items-center justify-center w-full h-16 border border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
              <span className="text-xs text-gray-300">Click to upload image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 text-sm text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
