# Note Guess

Train your ear by guessing notes played on **piano** or **guitar** in any octave (1–7).

Works as a **web app** and can be **installed on mobile** as a PWA (Progressive Web App).

## Features

- Piano and guitar sounds (synthesized via Tone.js)
- Octave range selector (e.g. octaves 2–5)
- Score, accuracy, and streak tracking
- Replay button to hear the note again
- Responsive design for phone and desktop
- Installable PWA on iOS/Android

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

## Install on Mobile

1. Open the app in Safari (iOS) or Chrome (Android)
2. **iOS:** Share → Add to Home Screen
3. **Android:** Menu → Install app / Add to Home Screen

## How to Play

1. Tap **Start Playing** to enable audio
2. Choose **Piano** or **Guitar**
3. Set your **octave range**
4. Tap **Play Note** and listen
5. Tap the note name you think you heard
6. Tap **Next Note** to continue
