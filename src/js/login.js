import { signIn, signup, userSignOut } from "./firebaseConfig";
import Panel from "./classPanel";
import logo from "../img/Pay-U-Print-logo.png";

class loginPanel extends Panel {
  _loginMarkup = `<header class="header header__login">
  <img
    class="header__login_logo"
    src="${logo}"
    alt="Pay-U-Print Logo"
  />
</header>
<main class="main container">
  <form class="signIn showform">
    <div class="form__textheader">Sign in your account</div>
    <div class="form__textheader_error error_signIn"></div>
    <button type="submit" class="btn form__btn_login btn__main">
      <h3>Login with Google</h3>
    </button>
    <button type="button" class="btn form__btn_swapform printnow">Print Now!</button>
  <div class="disclaimer">
    <p class="disclaimer__text">
      Disclaimer: By using our services, you agree to provide accurate
      account information (email, phone number, and password) necessary for
      file submissions. While we prioritize security, users are responsible
      for protecting their login credentials. Users must ensure submitted
      content complies with legal requirements, and any changes to our
      disclaimer will be effective immediately.
    </p>
  </div>
  </main>`;
  render() {
    this._clear(document.body);
    this.renderLogin();
  }
  renderLogin() {
    document.body.insertAdjacentHTML("afterbegin", this._loginMarkup);
    this.addLoginListener();
  }
  addLoginListener() {
    const printnow = document.querySelector(".printnow");
    const login = document.querySelector(".signIn");
    const textheader_error_login = document.querySelector(".error_signIn");
    login.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await signIn();
      } catch (e) {
        this._clear(textheader_error_login);
        this.renderError(textheader_error_login, e);
      }
    });
    printnow.addEventListener("click", (e) => {
      this.renderError(textheader_error_login, `Stay tuned!`);

      // this.renderPrintForm(null); //BUG: remove args to enable without signing in
    });
  }
}
export default new loginPanel();
