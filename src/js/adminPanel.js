import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
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
      console.log(`hello world!`);
    });
    database.addEventListener("click", async () => {
      console.log(`hello wolrd!`);
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
