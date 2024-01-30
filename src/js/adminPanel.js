import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  auth,
  db,
  getUserDocs,
  getUserProfile,
  userSignOut,
} from "./firebaseConfig";

import logo from "../img/Pay-U-Print-Admin-logo.png";
import { getUserProfile } from "./firebaseConfig.js";
import userPanel from "./userPanel";
class adminPanel extends userPanel {
  _header = `<header class="header panel_user">
  <img
    class="header__login_logo"
    src="${logo}"
    alt="Pay-U-Print Logo"
  />
  <nav class="nav">
    <ul class="nav__list">
      <li><button class="nav__btn upload">Upload</button></li>
      <li><button class="nav__btn analytics">Analytics</button></li>
      <li><button class="nav__btn database">Database</button></li>
      <li><button class="nav__btn history">History</button></li>
      <li><button class="nav__btn logout">Logout</button></li>
    </ul>
  </nav>
</header><main></main>`;
  constructor(uid, isAdmin) {
    super(uid, isAdmin);

    this.renderHeader();
    this.initAdminData();
  }
  async initAdminData() {
    // await this.initDataActiveDocs()
  }
  generateDBMarkup(data) {
    const trows = data
      .map(
        (data) =>
          `<tr>
        <td class="text-overflow">${data.userID}</td>
        <td class="center-text text-overflow">${data.filename}</td>
        <td class="center-text">${data.filepincode}</td>
        <td class="center-text">₱${data.price.toFixed(2)}</td>
        <td class="center-text capitalize">${data.colored}</td>
        <td class="center-text capitalize">${data.papersize}</td>
        <td class="center-text">${this.formatTimeStamp(data.timestamp)} </td>
        <td class="center-text text-overflow">${data.fileUrl}</td>
        <td class="center-text">${data.status}</td>
        </tr>`
      )
      .join("");
    return `<div class="container table-container">
  <table id="data-table">
    <thead>
      <tr>
      <th class="center-text">User ID</th>
      <th class="center-text">File Name</th>
      <th class="center-text">File PIN Code</th>
      <th class="center-text">Price</th>
      <th class="center-text">Print Color</th>
      <th class="center-text">Paper Size</th>
      <th class="center-text">Timestamp</th>
      <th class="center-text">File URL</th>
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

  async renderDB() {
    const q = query(collection(db, "printForms"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const printFormDocs = snapshot.docs.map((doc) => ({
      userID: doc.data().userID,
      filename: doc.data().filename,
      fileUrl: doc.data().fileURL,
      filepincode: doc.data().filePinCode,
      colored: doc.data().colored,
      papersize: doc.data().paperSize,
      price: doc.data().price,
      status: doc.data().status,
      timestamp: doc.data().timestamp,
    }));
    document.body.children[1].innerHTML = this.generateDBMarkup(printFormDocs);
    // renderDBListener()
  }

  renderHeader() {
    document.body.innerHTML = this._header;
    this.addHeaderListeners();
  }
  addHeaderListeners() {
    const upload = document.querySelector(".upload");
    const analytics = document.querySelector(".analytics");
    const database = document.querySelector(".database");
    const history = document.querySelector(".history");
    const logout = document.querySelector(".logout");

    upload.addEventListener("click", async () => {
      this.renderSpinner(document.body.children[1]);
      this._userProfile = await getUserProfile(auth.currentUser.uid);
      console.log("logging userprof");
      console.log(this._userProfile);
      this.renderPrintForm(this._userProfile);
    });
    analytics.addEventListener("click", () => {
      console.log(`hello wasdorld!`);
    });
    database.addEventListener("click", async () => {
      this.renderSpinner(document.body.children[1]);
      await this.renderDB();
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
// addHeaderListeners() {
//   const upload = document.querySelector(".upload");
//   const analytics = document.querySelector(".analytics");
//   const database = document.querySelector(".database");
//   const history = document.querySelector(".history");
//   const logout = document.querySelector(".logout");
//   upload.addEventListener("click", async () => {
//     this.renderSpinner(document.body.children[1]);
//     this._userProfile = await getUserProfile(auth.currentUser.uid);
//     this.renderPrintForm(this._userProfile);
//   });
//   history.addEventListener("click", async () => {
//     this.renderSpinner(document.body.children[1]);
//     this._userProfile = await getUserProfile(auth.currentUser.uid);
//     await this.renderHistory(this._userProfile);
//   });
//   logout.addEventListener("click", async () => {
//     try {
//       userSignOut();
//     } catch (e) {
//       alert(e);
//     }
//   });
// }

export default adminPanel;
