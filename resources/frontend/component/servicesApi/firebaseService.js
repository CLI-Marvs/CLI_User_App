//* FOR DEVELOPMENT API KEY
// import { initializeApp } from "firebase/app";
// import { getFirestore } from 'firebase/firestore';
// import { GoogleAuthProvider, getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: "AIzaSyDf0bS6JE1w8x15AyWgUruGO7DbtwcX1VY",
//   authDomain: "ipm-p-dd9d9.firebaseapp.com",
//   projectId: "ipm-p-dd9d9",
//   storageBucket: "ipm-p-dd9d9.appspot.com",
//   messagingSenderId: "711249701360",
//   appId: "1:711249701360:web:36718fec7817b5b4f65535",
//   measurementId: "G-1MLZNRKHYQ",
// };

// const app = initializeApp(firebaseConfig);

// const googleProvider = new GoogleAuthProvider();

// const fireDB = getFirestore(app);
// const auth = getAuth(app);

// export { fireDB, auth, googleProvider }

//* FOR PRODUCTION API KEY
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp); // use this one variable

export { firebaseApp, db, doc, updateDoc, getDoc };
