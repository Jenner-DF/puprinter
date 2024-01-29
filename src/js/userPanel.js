import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import logo from "../img/Pay-U-Print-logo.png";
import icons from "../img/icons.svg";
import classPanel from "./classPanel";
//prettier-ignore
import { auth, db, getUserDocs, getUserProfile, userSignOut } from "./firebaseConfig";
class userPanel extends classPanel {
  _header = `<header class="header panel_user">
  <img
    class="header__login_logo"
    src="${logo}"
    alt="Pay-U-Print Logo"
  />
  <nav class="nav">
    <ul class="nav__list">
      <li><button class="nav__btn upload">Upload</button></li>
      <li><button class="nav__btn history">History</button></li>
      <li><button class="nav__btn logout">Logout</button></li>
    </ul>
  </nav>
</header><main></main>`;
  constructor(uid, isAdmin) {
    super();
    if (!isAdmin) this.renderHeader();
    this.initUserData(uid);
  }
  async initUserData(uid) {
    try {
      //NOTE: if i put this._userProfile = await getUserProfile(auth.currentUser.uid); here, it will not get the updated data(wallet,history)
      this.getLiveActiveDocs(uid);
      await this.render();
    } catch (e) {
      alert(e);
    }
  }
  getLiveActiveDocs(uid) {
    const q = query(
      collection(db, "printForms"),
      where("userID", "==", uid),
      orderBy("timestamp", "desc")
    );
    onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({
          filename: doc.data().filename,
          filepincode: doc.data().filePinCode,
          papersize: doc.data().paperSize,
          timestamp: doc.data().timestamp,
          status: doc.data().status,
        });
      });
      this._activeDocs = docs; // update active docs array
      // console.log(this._activeDocs);
    });
  }
  async render() {
    console.log(auth.currentUser.uid);
    this._userProfile = await getUserProfile(auth.currentUser.uid);
    this.renderPrintForm(this._userProfile);
  }
  renderHeader() {
    document.body.innerHTML = this._header;
    this.addHeaderListeners();
  }
  addHeaderListeners() {
    const upload = document.querySelector(".upload");
    const history = document.querySelector(".history");
    const logout = document.querySelector(".logout");
    upload.addEventListener("click", async () => {
      this.renderSpinner(document.body.children[1]);
      this._userProfile = await getUserProfile(auth.currentUser.uid);
      this.renderPrintForm(this._userProfile);
    });
    history.addEventListener("click", async () => {
      this.renderSpinner(document.body.children[1]);
      this._userProfile = await getUserProfile(auth.currentUser.uid);
      await this.renderHistory(this._userProfile);
    });
    logout.addEventListener("click", async () => {
      try {
        userSignOut();
      } catch (e) {
        alert(e);
      }
    });
  }
}
export default userPanel;
//BUG: for next update idea
// async getLiveUserProfile(uid) {
//   const queryUserDocHistory = query(
//     collection(db, "users"),
//     where("uid", "==", uid)
//   );
//   onSnapshot(queryUserDocHistory, (querySnapshot) => {
//     this._userProfile;
//     querySnapshot.forEach((doc) => {
//       this._userProfile = {
//         history: doc.data().history,
//         isAdmin: doc.data().isAdmin,
//         password: doc.data().password,
//         secretpin: doc.data().secretpin,
//         uid: doc.data().uid,
//         users: doc.data().users,
//         wallet: doc.data().wallet,
//       };
//     });
//   });
// }
// BUG: REMOVED, getting snapshot of history when uploading printform because of .wallet update
// getDataLive(uid) {
//   const queryUserDocActive = query(
//     collection(db, "printForms"),
//     where("userID", "==", uid),
//     orderBy("timestamp", "desc")
//   );
//   const queryUserDocHistory = query(
//     collection(db, "users"),
//     where("uid", "==", uid)
//   );
//   this._unSubscribeActive = onSnapshot(
//     queryUserDocActive,
//     (querySnapshot) => {
//       const docs = [];
//       querySnapshot.forEach((doc) => {
//         docs.push({
//           filename: doc.data().filename,
//           filepincode: doc.data().filePinCode,
//           papersize: doc.data().paperSize,
//           timestamp: doc.data().timestamp,
//           status: doc.data().status,
//         });
//       });
//       this._activeDocs = docs; // update active docs array
//       this._allDocs = [...this._activeDocs];
//       console.log(`active:`);
//       asd(this._allDocs);
//     }
//   );
//   this._unSubscribeHistory = onSnapshot(
//     queryUserDocHistory,
//     (querySnapshot) => {
//       this._pastDocs = [];
//       querySnapshot.forEach((doc) => {
//         this._pastDocs = [...JSON.parse(doc.data().history)];
//       });
//       this._allDocs = [...this._activeDocs, ...this._pastDocs]; // update user's past docs array
//       console.log(`active + user history:`);
//       asd(this._allDocs);
//     }
//   );
//   function asd(asd) {
//     console.log(asd);
//   }
// }
// toggleSubscribe(subscribe) {
//   subscribe();
// }
