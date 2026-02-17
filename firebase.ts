import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAdKuMgMZ5fpJ4IfYUBEqW11Wx2ZW_FSsQ",
    authDomain: "electrosan-23ca4.firebaseapp.com",
    projectId: "electrosan-23ca4",
    storageBucket: "electrosan-23ca4.firebasestorage.app",
    messagingSenderId: "574094491451",
    appId: "1:574094491451:web:4bc9a07ae3ff9b38f1011e",
    measurementId: "G-R1S46GNC1Z"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true
});
export const auth = getAuth(app);
