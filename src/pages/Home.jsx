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
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Community Feed</h1>
          <p className="text-sm text-gray-400">
            {selectedCity ? `Posts in ${selectedCity}` : 'All neighborhoods'}
            {selectedCategory ? ` · ${selectedCategory}` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className={`flex items-center gap-1.5 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 shadow-sm ${
            showCreate
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
          }`}
        >
          <span className="text-base leading-none">{showCreate ? '×' : '+'}</span>
          {showCreate ? 'Close' : 'New Post'}
        </button>
      </div>

      {/* Create post */}
      {showCreate && (
        <div className="mb-5 animate-fade-in">
          <CreatePost onClose={() => setShowCreate(false)} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              !selectedCategory
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* City filter */}
        <form onSubmit={handleCityFilter} className="flex gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Filter by city (e.g. Mumbai, Delhi…)"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder:text-gray-300"
          />
          <button
            type="submit"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Apply
          </button>
          {selectedCity && (
            <button
              type="button"
              onClick={clearCity}
              className="bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
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
