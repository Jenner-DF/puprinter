import icons from "../img/icons.svg";
import PrintForm from "./printForms";
import { auth, signIn, signup } from "./firebaseConfig";
import { initPanel } from "./controller";

export default class Panel {
  _printFormMarkup = `
  <div class="container print__section">
    <div class='loader'></div>
    <div class="section print__section_wallet">
      <div class="printForm__text">Hello, PUPian!</div>
      <div class="wallet">
        <p class="wallet__text">Available Balance:</p>
        <div class="wallet__balance">₱547.20</div>
      </div>
    </div>
    <div class="section print__section_printForm">
      <!-- PRINTFORM -->
      <form class="printForm">
        <div class="printForm__section">
          <div class="printForm__text">Upload your Document</div>
          <!-- file/document -->
          <div class="printForm__file">
            <label for="file">
              <svg>
                <use href="${icons}#icon-uploadFile"></use>
              </svg>
              <p class="file_label">Upload a PDF file</p>
            </label>
            <input
              type="file"
              name="file"
              id="file"
              class="printForm__file_upload"
              accept="application/pdf"
            />
          </div>
        </div>
        <!-- paper size -->
        <div class="printForm__section">
          <label for="select-paper">Paper size</label>
          <select id="select-paper" name="select_paper" required>
            <option value="">Choose one option:</option>
            <option value="short">Short (8.5" x 11")</option>
            <option value="long">Long (8.5" x 13")</option>
          </select>
        </div>
        <!-- colored -->
        <div class="printForm__section">
          <label for="select-colored">Color</label>
          <select id="select-colored" name="select_colored" required>
            <option value="">Choose one option:</option>
            <option value="colored">Colored</option>
            <option value="grayscale">Grayscale</option>
          </select>
        </div>
        <div class="submit"><button>Submit</button></div>
      </form>
    </div>
  </div>`;
  renderHeader(markup, isAdmin = false) {
    document.body.insertAdjacentHTML("afterbegin", markup);
    this.addHeaderListener(isAdmin);
  }
  renderPrintForm() {
    document.body.children[1].innerHTML = this._printFormMarkup;
    this.addPrintFormListener();
  }
  renderLogin(loginmarkup) {
    document.body.insertAdjacentHTML("afterbegin", loginmarkup);
    this.addLoginListener();
  }
  renderHistory(markup) {
    this._clear();
    document.body.children[1].innerHTML = markup;
  }
  _clear(parentEl) {
    parentEl.innerHTML = "";
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
        this.renderSpinner(textheader_error_login);
        await signIn(email, password);
        await initPanel();
        this._clear(textheader_error_login);
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
  addPrintFormListener() {
    const printForm = document.querySelector(".printForm");
    const loaderEl = document.querySelector(".loader");
    const fileInput = printForm.querySelector("#file");
    const fileLabel = printForm.querySelector(".file_label");
    fileInput.addEventListener("change", function () {
      const selectedFile = this.files[0];
      if (selectedFile.type !== "application/pdf")
        return alert("Please upload PDF file only.");
      fileLabel.textContent = selectedFile.name;
      console.log(selectedFile);
    });
    printForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        if (!printForm.file.files[0]) throw new Error("No files uploaded yet!");
        if (printForm.file.files[0].type !== "application/pdf")
          throw new Error("Please upload PDF file only.");
        this.renderSpinner(loaderEl);
        await PrintForm.createInstance(
          printForm.file.files[0],
          printForm.select_colored.value,
          printForm.select_paper.value
        );
        this._clear(loaderEl);
        printForm.reset();
        fileLabel.textContent = "Upload a PDF file";
      } catch (e) {
        this.renderError(loaderEl, e);
      }
    });
  }
  addHeaderListener(isAdmin) {
    return isAdmin ? true : false;
    //userlisteners

    //adminlisteners
  }
  renderSpinner(parentEl) {
    const spinnerMarkup = `
    <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>
    `;
    this._clear(parentEl);
    parentEl.insertAdjacentHTML("afterbegin", spinnerMarkup);
  }
  renderError(parentEl, error) {
    this._clear(parentEl);
    parentEl.insertAdjacentHTML("afterbegin", error);
  }
}
