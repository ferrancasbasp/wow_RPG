const firebaseConfig = {
  apiKey: "AIzaSyCxsMUUHvw_LQrl24VgDtJiperHF2rRL_Y",
  authDomain: "rpgwow-118f7.firebaseapp.com",
  databaseURL: "https://rpgwow-118f7-default-rtdb.firebaseio.com",
  projectId: "rpgwow-118f7",
  storageBucket: "rpgwow-118f7.firebasestorage.app",
  messagingSenderId: "408168433969",
  appId: "1:408168433969:web:d1f8521365c247ac934810",
  measurementId: "G-STV8D02FJV"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
