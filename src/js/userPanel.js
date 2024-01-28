import logo from "../img/Pay-U-Print-logo.png";
import icons from "../img/icons.svg";
import classPanel from "./classPanel";
import { initLogin } from "./controller";
import { getUserDetails, userSignOut } from "./firebaseConfig";
class userPanel extends classPanel {
  _userData = getUserDetails();
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
    history.addEventListener("click", () => {
      this.renderHistory();
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
  renderHistory() {
    document.body.children[1].innerHTML = `<h1>hello WORLD! </h1>`;
  }
}
export default new userPanel();
