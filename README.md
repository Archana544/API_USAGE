A cross-platform React Native (Expo) application that integrates maps, geolocation, and Firebase Firestore to enable real-time, location-aware features.
The app is built to run seamlessly on Android, iOS, and Web using a single codebase.

🚀 Features

📱 Cross-platform support (Android, iOS, Web)

🗺️ Interactive maps using react-native-maps

📍 Real-time user location tracking

☁️ Firebase Firestore integration for cloud data storage

🔄 API communication using Axios

🧭 Navigation using React Navigation

🔥 Firebase-backed scalable architecture

🛠️ Tech Stack
Frontend / Mobile

React Native 0.79

Expo SDK 53

React 19

React Navigation

Axios

Maps & Location

react-native-maps

expo-location

react-native-geolocation-service

Backend / Cloud

Firebase

Firestore (NoSQL database)

Firebase App initialization

📂 Project Structure
project_group_10/
│
├── services/
│   └── firebase.js        # Firebase configuration & Firestore instance
│
├── screens/               # App screens (Map, Home, etc.)
├── components/            # Reusable UI components
├── navigation/            # Navigation setup
├── App.js                 # App entry point
├── package.json
└── README.md

🔥 Firebase Setup

Firebase is initialized in:

// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "project-group-10-240b3.firebaseapp.com",
  projectId: "project-group-10-240b3",
  storageBucket: "project-group-10-240b3.appspot.com",
  messagingSenderId: "39158595335",
  appId: "1:39158595335:web:a9173d502228b39eb10fa2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


⚠️ Important:
For production, move Firebase keys to environment variables (.env) and avoid committing secrets.

▶️ Getting Started
1️⃣ Install dependencies
npm install

2️⃣ Start Expo
npm start

3️⃣ Run on specific platforms
npm run android
npm run ios
npm run web

🧭 Navigation

The app uses React Navigation:

Stack-based navigation

Screen-to-screen routing

Mobile-friendly transitions

🗺️ Location & Maps

Requests user location permissions

Displays live user location on the map

Supports markers and map interactions

Uses native map rendering for performance

☁️ Firestore Usage

Firestore is used for:

Storing location-based data

Persisting user-generated content

Enabling real-time updates

Example usage:

import { db } from '../services/firebase';

📦 Scripts
Command	Description
npm start	Start Expo dev server
npm run android	Run on Android emulator/device
npm run ios	Run on iOS simulator
npm run web	Run on web browser
🔒 Security Notes

Firebase rules should restrict unauthorized access

API keys should be environment-protected

Location permissions are explicitly requested

