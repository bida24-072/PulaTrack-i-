    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";
    
    const firebaseConfig = {
      apiKey: "AIzaSyD4DdDN1Uq1r3SkZ0mTHZIqnab5LHagHmY",
      authDomain: "pulatrack-bw.firebaseapp.com",
      projectId: "pulatrack-bw",
      storageBucket: "pulatrack-bw.firebasestorage.app",
      messagingSenderId: "914761828833",
      appId: "1:914761828833:web:79b7e42247535264a56aa0"
    };
    
    const app = initializeApp(firebaseConfig);
    export const auth = getAuth(app);
    export const db = getFirestore(app);
