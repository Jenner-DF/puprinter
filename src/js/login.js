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
    <div class="form__textheader">Hello, PUPian!</div>
    <p><h2>GUIDE:</h2></p>
    <p><h2>THIS IS FOR ACADEMIC PURPOSES ONLY.</h2></p>
    <p><h2>PLEASE ASK MR. LALUSIN FOR INSTRUCTIONS. TY!</h2></p>
    <div class="form__textheader_error error_signIn"></div>
    <!-- PRINTFORM -->
    <div class=form__btns>
    <!--
      <button class="btn form__btn_login btn__main login">
        <h3>Login with Google</h3>
      </button>
      <div class="center-text">OR </div> -->
      <button class="btn form__btn_swapform btn__main printnow"><h4>Print Now</h4></button>
    </div>
  </div>
  </main>
  <div>
    <h1 style="text-align:center;padding: 10px 0">Output PDF:</h1>
    <div class="canvas_container">
    </div>
    </div>
  <div class="disclaimer">
  <p class="disclaimer__text">
    Disclaimer: By using our services, you agree to provide accurate information necessary for file submissions. Users are responsible for ensuring submitted content complies with legal requirements. Any changes to this disclaimer will be effective immediately.
  </p>
</div>
</div>
    `;
  render() {
    this._clear(document.body);
    this.renderLogin();
    this._parentEl = document.querySelector(".main");
  }
  renderLogin() {
    document.body.insertAdjacentHTML("afterbegin", this._loginMarkup);
    this.addLoginListener();
  }
  addLoginListener() {
    const printnow = document.querySelector(".printnow");
    // const login = document.querySelector(".login");
    // const textheader_error_login = document.querySelector(".error_signIn");
    // login.addEventListener("click", async (e) => {
    //   try {
    //     await signIn();
    //   } catch (e) {
    //     this._clear(textheader_error_login);
    //     this.renderError(textheader_error_login, e);
    //   }
    // });
    printnow.addEventListener("click", (e) => {
      this.renderPrintForm();
      printnow.style.display = "none";
    });
  }
}
export default new loginPanel();
