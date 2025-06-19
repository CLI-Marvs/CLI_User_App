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
    apiKey: "AIzaSyAzNe-Cze3IN-EyAbqWb6S-UYHogIH0Z_E",
    authDomain: "emoji-walkin.firebaseapp.com",
    projectId: "emoji-walkin",
    storageBucket: "emoji-walkin.firebasestorage.app",
    messagingSenderId: "149760841574",
    appId: "1:149760841574:web:33276974a87553c77c5aa7",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp); // use this one variable

export { firebaseApp, db, doc, updateDoc, getDoc };
