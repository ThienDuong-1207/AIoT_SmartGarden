# Cấu hình của Firebase
npm install firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuKgfehg6LHDhIooJQD0SS3BOBMfHGg7I",
  authDomain: "aiot-smart-garden-c2373.firebaseapp.com",
  projectId: "aiot-smart-garden-c2373",
  storageBucket: "aiot-smart-garden-c2373.firebasestorage.app",
  messagingSenderId: "1009608031859",
  appId: "1:1009608031859:web:a9ed3c75dfc0d5edd03406",
  measurementId: "G-XREVDNTT7V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

