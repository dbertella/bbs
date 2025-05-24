import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCNxU4Z_xWcYUQ2QcWWw_p3TFEtkQdLwUY",
  authDomain: "bertella-s-booking-system.firebaseapp.com",
  projectId: "bertella-s-booking-system",
  storageBucket: "bertella-s-booking-system.firebasestorage.app",
  messagingSenderId: "560052815286",
  appId: "1:560052815286:web:7fbcaf30e60d2b18beed17",
  measurementId: "G-WYYPJ7VB92",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
