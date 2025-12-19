// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBG97aUM3xmW98nUwbyLdOV49rMY9K-fWA",
  authDomain: "project-group-10-240b3.firebaseapp.com",
  projectId: "project-group-10-240b3",
  storageBucket: "project-group-10-240b3.appspot.com",
  messagingSenderId: "39158595335",
  appId: "1:39158595335:web:a9173d502228b39eb10fa2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);