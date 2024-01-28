import { signIn, signup } from "./firebaseConfig";
import { initPanel } from "./controller";
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
    <div class="form">
      <input
        type="email"
        name="email"
        placeholder="Email address"
        class="form__entryfield"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        class="form__entryfield"
        required
      />
      <div class="form__btns">
        <button type="submit" class="btn form__btn_login btn__main">
          Login
        </button>
        <button type="button" class="btn form__btn_swapform">Register</button>
      </div>
    </div>
  </form>
  <form class="signUp">
    <div class="form__textheader">Create your account</div>
    <div class="form__textheader_error error_signUp"></div>

    <div class="form">
      <input
        type="email"
        name="email"
        placeholder="Email address"
        class="form__entryfield"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        class="form__entryfield"
        required
      />
      <input
        type="tel"
        name="secretpin"
        placeholder="Secret 5-digit Pin Code"
        class="form__entryfield"
        pattern="\\d{5}"
        minlength="5"
        maxlength="5"
        required
      />
      <div class="form__btns">
        <button type="submit" class="btn form__btn_register btn__main">
          Register
        </button>
        <button type="button" class="btn form__btn_swapform">Login</button>
      </div>
    </div>
  </form>
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
    const registerForm = document.querySelector(".signUp");
    const loginForm = document.querySelector(".signIn");
    const btnSwapForms = document.querySelectorAll(".form__btn_swapform");
    const textheader_error_login = document.querySelector(".error_signIn");
    const textheader_error_register = document.querySelector(".error_signUp");
    btnSwapForms.forEach(function (btnSwapForm) {
      btnSwapForm.addEventListener("click", function (e) {
        e.preventDefault();
        registerForm.classList.toggle("showform");
        loginForm.classList.toggle("showform");
      });
    });
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      try {
        this.renderSpinner(document.body.children[1]);
        await signIn(email, password);
        await initPanel();
      } catch (e) {
        this.renderError(textheader_error_login, e);
      }
    });
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = registerForm.email.value;
      const password = registerForm.password.value;
      const secretpin = registerForm.secretpin.value;
      console.log(email, password, secretpin);
      try {
        this.renderSpinner(textheader_error_register);
        await signup(email, password, secretpin);
        this._clear(textheader_error_register);
        register_succesful();
      } catch (e) {
        this.renderError(textheader_error_register, e);
      }
    });
    function register_succesful() {
      textheader_error_register.innerHTML = "";
      textheader_error_register.innerHTML = "Account Registered Successfully!";
    }
  }
}
export default new loginPanel();
