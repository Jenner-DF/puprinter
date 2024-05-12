import { signIn, signup, userSignOut } from "./firebaseConfig";
import Panel from "./Panel";
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
  <div class="signIn">
    <div class="form__textheader">Sign in your account</div>
    <div class="form__textheader_error error_signIn"></div>
    <div class=form__btns>
      <button class="btn form__btn_login btn__main login">
        <h3>Login with Google</h3>
      </button>
      <div class="center-text">OR </div>
      <button class="btn form__btn_swapform printnow">Print Now XD!</button>
      <button class="bombastic">Print Now XD!</button>
    </div>
  </div>
  </main>
  <div class="disclaimer">
  <p class="disclaimer__text">
    Disclaimer: By using our services, you agree to provide accurate
    account information (email, phone number, and password) necessary for
    file submissions. While we prioritize security, users are responsible
    for protecting their login credentials. Users must ensure submitted
    content complies with legal requirements, and any changes to our
    disclaimer will be effective immediately.
  </p>
</div>`;
  render() {
    this._clear(document.body);
    this.renderLogin();
    this._parentEl = document.querySelector(".main");
    this.bombastic = document.querySelector(".bombastic");
    this.bombastic.addEventListener("click", async (e) => {
      const response = await fetch("./.netlify/functions/hello-world").then(
        (response) => response.json()
      );
      this.bombastic.textContent = response;
      console.log(e);
      console.log("bombastic side eye!");
    });
  }
  renderLogin() {
    document.body.insertAdjacentHTML("afterbegin", this._loginMarkup);
    this.addLoginListener();
  }
  addLoginListener() {
    const printnow = document.querySelector(".printnow");
    const login = document.querySelector(".login");
    const textheader_error_login = document.querySelector(".error_signIn");
    login.addEventListener("click", async (e) => {
      try {
        await signIn();
      } catch (e) {
        this._clear(textheader_error_login);
        this.renderError(textheader_error_login, e);
      }
    });
    printnow.addEventListener("click", (e) => {
      this.renderPrintForm();
      printnow.style.display = "none";
    });
  }
}
export default new loginPanel();
