import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import logo from "../img/Pay-U-Print-logo.png";
import icons from "../img/icons.svg";
import Panel from "./Panel";
//prettier-ignore
import { auth, db, getUserDocs, getUserProfile, userSignOut } from "./firebaseConfig";
class userPanel extends Panel {
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
          paperType: doc.data().paperType,
          colorOption: doc.data().colorOption,
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
  generateUserHistoryMarkup(data) {
    //NOTE: merge history of admin and user, set flags to get which data is displayed
    const trows = data
      .map(
        (data) =>
          `<tr>
          <td class="text-overflow">${data.filename}</td>
          <td class="center-text">${data.filepincode}</td>
          <td class="center-text capitalize">${data.paperType}</td>
          <td class="center-text capitalize">${data.colorOption}</td>
          <td class="center-text">${this.formatTimeStamp(data.timestamp)}</td>
          <td class="center-text">${data.status}</td>
          </tr>`
      )
      .join("");
    return `<div class="container table-container">
    <table id="data-table">
      <thead>
        <tr>
        <th>Filename</th>
        <th class="center-text">File Pincode</th>
        <th class="center-text">Paper Type</th>
        <th class="center-text">Color Option</th>
        <th class="center-text">Date Uploaded</th>
        <th class="center-text">Status</th>
        </tr>
      </thead>
      <tbody>
        ${trows}
      </tbody>
    </table>
  </div>
  <!--<div id="pagination">
    <button id="prevPage">Previous</button>
    <span id="currentPage">1</span>
    <button id="nextPage">Next</button>
  </div> -->`;
  }

  async renderHistory(userProfile) {
    this._pastDocs = JSON.parse(userProfile.history);

    // NOTE: it works because it is still under new userPanel()
    const allDocs = [...this._activeDocs, ...this._pastDocs];
    console.log(allDocs);
    document.body.children[1].innerHTML =
      this.generateUserHistoryMarkup(allDocs); //NOTE: VIEW ONLY
  }
  generateWalletMarkup() {
    return `
    <div class="container print__section">
    <div class='loader'></div>
    <div class="section print__section_wallet">
      <div class="printForm__text">Hello, ${user.displayName}!</div>
      <div class="wallet">
        <p class="wallet__text">Available Balance:</p>
        <div class="wallet__balance">₱${user.wallet.toFixed(2)}</div>
      </div>
    </div>
    `;
  }
  renderWallet() {}
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
