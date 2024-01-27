import logo from "../img/Pay-U-Print-logo.png";
import icons from "../img/icons.svg";
import classPanel from "./classPanel";
import { getUserDetails } from "./firebaseConfig";
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
      <li><button class="nav__btn">Upload</button></li>
      <li><button class="nav__btn">History</button></li>
      <li><button class="nav__btn">Logout</button></li>
    </ul>
  </nav>
</header><main></main>`;
}
export default new userPanel();
