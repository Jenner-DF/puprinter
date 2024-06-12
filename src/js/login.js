import { signIn, signup, userSignOut } from "./firebaseConfig";
import Panel from "./Panel";
import logo from "../img/PUPrinter_mainlogo.png";

class loginPanel extends Panel {
  _loginMarkup = `<header class="header header__login">
  <a href="#" onclick="location.reload();">
    <img
      class="header__login_logo"
      src="${logo}"
      alt="Pay-U-Print Logo"
    />
  </a>
</header>
<main class="main container">
<div class="signIn">
  <div class="instructions">
    <h1>How to Use Our Pay-U-Print Machine:</h1>
    <p>Step 1: <span>Fill Form: Quick and easy.</span></p>
    <p>Step 2: <span>Save PIN: Needed for printing.</span></p>
    <p>Step 3: <span>Enter PIN: Use machine in CEA 423.</span></p>
    <p>Step 4: <span>Insert Coins: Print and collect.</span></p>
  </div>
  <div class="form__textheader_error error_signIn"></div>
  <button class="btn form__btn_swapform btn__main printnow"><h3>Print Now</h3></button>
  <div class="survey">
  <button class="btn form__btn_swapform  printnow"  onclick="window.location.href='https://forms.gle/2fWLparc8xAhkPb49';"><h4>Take a Pre-survey! </h4></button>
  <button class="btn form__btn_swapform  printnow" onclick="window.location.href='https://forms.gle/uAtbzjUKCDhCdPrUA';"><h4>Take a Post-survey!</h4></button>
  </div>
  <a href="#" id='admin' style="display: none;">Admin</a>

    <!-- PRINTFORM -->
    <!--
    <div class=form__btns>
      <button class="btn form__btn_login btn__main login">
        <h3>Login with Google</h3>
      </button>
      <div class="center-text">OR </div> 
    </div>
    -->
  </div>
  </main>
  <div class="disclaimer">
    <p class="disclaimer__text">
      Disclaimer: By using our services, you agree to provide accurate information necessary for file submissions. Users are responsible for ensuring submitted content complies with legal requirements. Any changes to this disclaimer will be effective immediately.
    </p>
  </div>
</div>
<!-- DIALOG -->
         <dialog class="modal price-breakdown">
        <div class="modal-title">Price Breakdown:</div>
        <div class="transaction">
            <div class="page">
              <div class="page-number">Page 1 </div>
              <div class="page-colorPercent">Color (12.41%)  <span class="percent">₱2</span> </div>
            </div><div class="page">
              <div class="page-number">Page 2 </div>
              <div class="page-colorPercent">Color (0.22%)  <span class="percent">₱2</span> </div>
            </div><div class="page">
              <div class="page-number">Page 3 </div>
              <div class="page-colorPercent">Color (8.86%)  <span class="percent">₱2</span> </div>
            </div><div class="page">
              <div class="page-number">Page 4 </div>
              <div class="page-colorPercent">Color (13.73%)  <span class="percent">₱6</span> </div>
            </div><div class="page">
              <div class="page-number">Page 5 </div>
              <div class="page-colorPercent">Color (33.16%)  <span class="percent">₱8</span> </div>
            </div><div class="page">
              <div class="page-number">Page 6 </div>
              <div class="page-colorPercent">Color (0.62%)  <span class="percent">₱2</span> </div>
            </div><div class="page">
              <div class="page-number">Page 7 </div>
              <div class="page-colorPercent">Color (1.28%)  <span class="percent">₱2</span> </div>
            </div>
        </div>
        <div class="total-amount">Total: ₱24</div>
        <div class="modal__section modal__btns">
        <button class="btn closeModal">Cancel</button>
        <button class="btn btn__main btnSubmit">Confirm</button>
        </div>
        </dialog>
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
    // const modal = document.querySelector(".modal");
    // modal.showModal();
    // console.log(modal);
    const printnow = document.querySelector(".printnow");
    const login = document.querySelector("#admin");
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
