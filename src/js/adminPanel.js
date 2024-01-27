import classPanel from "./classPanel";
class adminPanel extends classPanel {
  _userData;
  _panelHeader = `<header class="header panel_user">
  <img
    class="header__login_logo"
    src="./src/img/Pay-U-Print-logo.png"
    alt="Pay-U-Print Logo"
  />
  <nav class="nav">
    <ul class="nav__list">
      <li><button class="nav__btn">Upload</button></li>
      <li><button class="nav__btn">History</button></li>
      <li><button class="nav__btn">Logout</button></li>
    </ul>
  </nav>
</header>`;
}

export default new adminPanel();
