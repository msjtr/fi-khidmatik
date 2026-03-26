// Firebase Config الحقيقي
const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "xxxxx.firebaseapp.com",
  projectId: "xxxxx",
  storageBucket: "xxxxx.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123:web:xxxx"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
