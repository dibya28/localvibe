# LocalVibe — Hyperlocal Community Board

A real-time community board for your neighborhood. Share events, deals, lost items, skills, and more with people nearby.

## Features

| Feature | Details |
|---|---|
| **Google OAuth** | Firebase Auth with popup flow; protected routes redirect unauthenticated users |
| **Real-time feed** | Firestore `onSnapshot` listener — posts appear instantly for all viewers |
| **Create posts** | Title · body · category · city tag · optional image upload (Firebase Storage) |
| **Category filter** | Filter by Events / Deals / Lost & Found / Skills / Rants |
| **City filter** | Narrow feed to any city string |
| **Upvoting** | Atomic `increment` + `arrayUnion/arrayRemove` — no double-voting |
| **Threaded comments** | Firestore subcollection `/posts/{id}/comments` with live updates |
| **User profiles** | Display name + photo pulled from Google account on every post/comment |
| **Loading skeletons** | Animated placeholders while feed loads |
| **Toast notifications** | `react-hot-toast` for errors and success messages |
| **Firebase Hosting** | `firebase.json` configured with SPA rewrite and cache headers |

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **React Router 6**
- **Firebase 10** (Firestore, Auth, Storage, Hosting)
- **react-hot-toast**

## Project Structure

```
src/
├── components/
│   ├── Feed.jsx            # Feed list with loading skeletons + empty states
│   ├── PostCard.jsx        # Post with upvote, image, category badge, comments toggle
│   ├── CreatePost.jsx      # Form with image upload + progress bar
│   ├── CommentSection.jsx  # Threaded comments with live updates
│   └── Navbar.jsx          # Sticky nav with avatar link to profile
├── context/
│   └── AuthContext.jsx     # Auth state via React Context + useReducer
├── hooks/
│   ├── useAuth.js          # Consumes AuthContext
│   └── usePosts.js         # Firestore real-time posts with filter support
├── firebase/
│   └── firebase.js         # Firebase SDK init from env vars
└── pages/
    ├── Home.jsx            # Feed page with category + city filters
    ├── Login.jsx           # Google sign-in page
    └── Profile.jsx         # User profile + sign-out
```

## Setup

### 1. Install dependencies

```bash
cd LocalVibe
npm install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project.
2. **Authentication** → Sign-in method → enable **Google**.
3. **Firestore Database** → Create database → start in **production mode**.
4. **Storage** → Get started.
5. **Project Settings** → Your apps → Add web app → copy config values.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Firebase config:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Deploy security rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # choose your project
firebase deploy --only firestore:rules,storage
```

### 5. Create Firestore composite indexes

When you first use category + city filters together, Firestore will show a link in the browser console to auto-create the required composite index. Click it or create manually:

- Collection: `posts` | Fields: `category ASC`, `createdAt DESC`
- Collection: `posts` | Fields: `city ASC`, `createdAt DESC`
- Collection: `posts` | Fields: `category ASC`, `city ASC`, `createdAt DESC`

### 6. Run dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 7. Deploy to Firebase Hosting

```bash
npm run deploy
```

Update `.firebaserc` with your actual project ID first.

## Firestore Data Model

```
posts/{postId}
  title:        string
  body:         string
  category:     "Events" | "Deals" | "Lost & Found" | "Skills" | "Rants"
  city:         string
  imageUrl:     string | null
  authorId:     string   (Firebase UID)
  authorName:   string
  authorPhoto:  string
  upvotes:      number
  upvotedBy:    string[] (UIDs)
  commentCount: number
  createdAt:    timestamp

  comments/{commentId}
    body:        string
    authorId:    string
    authorName:  string
    authorPhoto: string
    createdAt:   timestamp
```

## Security Rules Summary

- **Posts/comments**: anyone can read; only authenticated users can write
- **Post creation**: `authorId` must match the authenticated user's UID
- **Upvotes**: any authenticated user can modify `upvotes` + `upvotedBy` fields only
- **Comments**: immutable after creation; only the author can delete
- **Storage**: authenticated users only, images only, max 5 MB per file
