import logo from "../img/Pay-U-Print-logo.png";
import icons from "../img/icons.svg";
import classPanel from "./classPanel";
import { initLogin } from "./controller";
//prettier-ignore
import { auth, getUserDocs, getUserProfile, userSignOut } from "./firebaseConfig";
class userPanel extends classPanel {
  _userDocs;
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
  constructor(uid) {
    super();
    this.initUserData(uid);
  }
  async initUserData(uid) {
    try {
      this._userData = await getUserProfile(uid);
      this._activeDocs = await getUserDocs(auth.currentUser.uid);
      this._pastDocs = this._userData.history;
      console.log(this._userData);
      this.render();
    } catch (e) {
      alert(e);
    }
  }
  render() {
    this._clear(document.body);
    this.renderHeader();
    this.renderPrintForm();
  }
  renderHeader() {
    document.body.innerHTML = this._header;
    this.addHeaderListeners();
  }
  addHeaderListeners() {
    const upload = document.querySelector(".upload");
    const history = document.querySelector(".history");
    const logout = document.querySelector(".logout");
    upload.addEventListener("click", () => {
      this.renderPrintForm();
    });
    history.addEventListener("click", async () => {
      await this.renderHistory();
    });
    logout.addEventListener("click", async () => {
      try {
        userSignOut();
        initLogin();
      } catch (e) {
        alert(e);
      }
    });
  }
  async renderHistory() {
    const pastDocs = this._pastDocs.map((doc) => ({
      filename: doc.filename,
      filepincode: doc.filePinCode,
      papersize: doc.paperSize,
      timestamp: doc.timestamp,
    }));
    const activeDocs = this._activeDocs.docs.map((doc) => ({
      filename: doc.data().filename,
      filepincode: doc.data().filePinCode,
      papersize: doc.data().paperSize,
      timestamp: this.formatTimeStamp(doc.data().timestamp),
    }));
    console.log(activeDocs);
    console.log(pastDocs);

    document.body.children[1].innerHTML = `<h6>${this._userData}</h6>`;
  }
  formatTimeStamp(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const formattedDate =
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" + // Months are 0-based
      String(date.getDate()).padStart(2, "0") +
      "-" +
      date.getFullYear();
    return formattedDate;
  }
}
export default userPanel;
