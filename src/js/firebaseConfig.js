import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
//prettier-ignore
import {getFirestore,collection,getDocs,addDoc,deleteDoc,doc,onSnapshot,query,where,orderBy,serverTimestamp,Timestamp,
getDoc,updateDoc,setDoc,runTransaction} from "firebase/firestore";
//prettier-ignore
import {getAuth,createUserWithEmailAndPassword,signOut,signInWithEmailAndPassword, SignInMethod, signInWithPopup,GoogleAuthProvider,getAdditionalUserInfo} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyClDV5K8rNhF8u-QWJwzv3iWXvYDsR2xto",
  authDomain: "puprinter-efcd0.firebaseapp.com",
  databaseURL: "https://puprinter-efcd0-default-rtdb.firebaseio.com",
  projectId: "puprinter-efcd0",
  storageBucket: "puprinter-efcd0.appspot.com",
  messagingSenderId: "648059109438",
  appId: "1:648059109438:web:d1d10e27442c0ecad1916f",
};
//init firebase
const app = initializeApp(firebaseConfig);
//init auth
const auth = getAuth();
//init firestore
const db = getFirestore(app);
//init storage
const storage = getStorage(app);
//init googleSignin
const provider = new GoogleAuthProvider();
//login account
async function signIn() {
  try {
    // await signInWithEmailAndPassword(auth, email, password);
    const result = await signInWithPopup(auth, provider);
    const userinfo = getAdditionalUserInfo(result);
    if (userinfo.isNewUser) await newUserDB(result.user);
  } catch (e) {
    throw e.message;
  }
}
//register account
// async function signup(email, password, secretpin) {
//   try {
//     const credential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     const userdata = credential.user;
//     await newUserDB(userdata, password, secretpin);
//   } catch (e) {
//     throw e;
//   }
// }
// sign out account
async function userSignOut() {
  try {
    await signOut(auth);
  } catch (e) {
    throw e;
  }
}
//adds and checks to users db for duplicate
async function newUserDB(user) {
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAdmin: false,
        wallet: 0,
        history: "[]",
        AccountCreationDate: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    throw e;
  }
}

//returns bool checks user has Admin privilege
async function isAdmin() {
  return getUserProfile(auth.currentUser.uid).isAdmin;
}
//get firebase user profile of currently logged in
async function getUserProfile(uid) {
  const docRef = doc(db, "users", uid);
  const getdoc = await getDoc(docRef);
  return getdoc.data();
}
async function getUserDocs(uid) {
  const q = query(
    collection(db, "printForms"),
    where("userID", "==", uid),
    orderBy("timestamp", "desc")
  );
  return await getDocs(q);
}

export {
  app,
  query,
  orderBy,
  serverTimestamp,
  storage,
  doc,
  getDoc,
  getDocs,
  getUserProfile,
  getUserDocs,
  ref,
  addDoc,
  collection,
  db,
  getDownloadURL,
  uploadBytes,
  auth,
  signIn,
  signup,
  isAdmin,
  userSignOut,
  runTransaction,
};
