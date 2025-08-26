import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration provided by the user
const firebaseConfig = {
	apiKey: "AIzaSyDyQ4pGqKrON9FdQZi0tLUddyoRo5B1OoA",
	authDomain: "hackathon-e799d.firebaseapp.com",
	projectId: "hackathon-e799d",
	storageBucket: "hackathon-e799d.firebasestorage.app",
	messagingSenderId: "14869749450",
	appId: "1:14869749450:web:f9e5b6a732e19933551e33",
	measurementId: "G-9WFFXWSCYF",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Analytics may not be available in SSR or some environments; guard it
export const analyticsPromise = isAnalyticsSupported().then((supported) =>
	supported ? getAnalytics(app) : null
);

// Export Firebase Auth instance
export const auth = getAuth(app);

// Export Firestore instance with long-polling auto-detection to bypass third-party cookie issues
export const db = initializeFirestore(app, {
	experimentalAutoDetectLongPolling: true,
});
