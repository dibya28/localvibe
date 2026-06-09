import { useState } from 'react'
import Feed from '../components/Feed'
import CreatePost from '../components/CreatePost'

const CATEGORIES = ['Events', 'Deals', 'Lost & Found', 'Skills', 'Rants']

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityInput, setCityInput] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const handleCityFilter = (e) => {
    e.preventDefault()
    setSelectedCity(cityInput.trim())
  }

  const clearCity = () => {
    setSelectedCity('')
    setCityInput('')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Community Feed</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {selectedCity ? selectedCity : 'All neighborhoods'}
            {selectedCategory ? ` · ${selectedCategory}` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors ${
            showCreate
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          {showCreate ? 'Cancel' : '+ New post'}
        </button>
      </div>

      {/* Create post */}
      {showCreate && (
        <div className="mb-6">
          <CreatePost onClose={() => setShowCreate(false)} />
        </div>
      )}

      {/* Filters */}
      <div className="mb-5">
        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              !selectedCategory
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* City filter */}
        <form onSubmit={handleCityFilter} className="flex gap-2 mt-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Filter by city…"
            className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-300"
          />
          <button
            type="submit"
            className="text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Apply
          </button>
          {selectedCity && (
            <button
              type="button"
              onClick={clearCity}
              className="text-xs font-medium px-3 py-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Feed */}
      <Feed category={selectedCategory} city={selectedCity} />
    </div>
  )
}
