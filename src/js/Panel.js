import { doc, onSnapshot } from "firebase/firestore";
import icons from "../img/icons.svg";
import printerloading from "../img/printerloading.gif";
import PrintForm from "./printForms";
import { auth, db, getUserProfile } from "./firebaseConfig";

export default class Panel {
  _parentEl;
  generatePrintFormMarkup(user) {
    // console.log(user); NOTE: make an object and set it to ${} so without signing in is ok! or divide wallet section
    console.log(user);
    return `
    <div class="section print__section_printForm">
      <!-- PRINTFORM -->
      <div class="errormsg"></div>
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
        <!-- payment option -->
        <div class="printForm__section">
          <label for="select-payment">Payment Option</label>
          <select id="select-payment" name="select_payment" required>
            <option value="">Choose one option:</option>
            <option value="wallet"  ${user ? "" : "disabled"}>E-wallet</option>
            <option value="machine">At the Machine</option>
          </select>
        </div>
        <div class="submit"><button type="button" class="openDialog">Submit</button></div>
      </form>
        <!-- DIALOG -->
        <dialog class="modal">
        </dialog>
    </div>`;
  }

  async renderPrintForm(userProfile = null) {
    const printFormMarkup = this.generatePrintFormMarkup(userProfile);
    this._parentEl.insertAdjacentHTML("beforeend", printFormMarkup);
    this.addPrintFormListener();
  }
  addPrintFormListener() {
    this.modal = document.querySelector(".modal");
    this.printForm = document.querySelector(".printForm");
    this.errorEl = document.querySelector(".errormsg");
    const fileInput = this.printForm.querySelector("#file");
    this.fileLabel = this.printForm.querySelector(".file_label");
    const openDialog = this.printForm.querySelector(".openDialog");

    fileInput.addEventListener("change", function () {
      //need to be function() to get this
      const selectedFile = this.files[0];
      if (selectedFile.type !== "application/pdf")
        return alert("Please upload PDF file only.");

      document.querySelector(".file_label").textContent = selectedFile.name;
      console.log(selectedFile);
    });
    // open modal after clicking submit
    openDialog.addEventListener("click", async () => {
      try {
        if (!this.printForm.file.files[0])
          throw new Error("No files uploaded yet!");
        if (this.printForm.file.files[0].type !== "application/pdf")
          throw new Error("Please upload PDF file only.");
        if (
          this.printForm.select_colored.value === "" ||
          this.printForm.select_paper.value === "" ||
          this.printForm.select_payment.value === ""
        )
          throw new Error("Please ensure all form fields are completed");
        this.paymentOption = this.printForm.select_payment.value;
        await this.renderPrintFormDialog();

        //NOTE: ADD HERE REMOVE BOTTOM
        //show Price Dialog
        // this.renderSpinner(modImg);
        // this.priceFile = await PrintForm._generatePriceAmount(
        //   printForm.file.files[0],
        //   printForm.select_paper.value,
        //   printForm.select_colored.value,
        //   true
        // );
        // this._clear(modImg);
        // this.renderSpinner(modImg);
        // const wallet = await getUserProfile(auth.currentUser.uid);
        // console.log(wallet.wallet);
        // showPriceDialog(this.priceFile, wallet.wallet);
      } catch (e) {
        this.renderError(this.errorEl, e);
      }
    });
    // function showPriceDialog(price, wallet) {
    //   const priceFile = price;
    //   const walletBal = wallet;
    //   modText.innerHTML = "";
    //   modImg.innerHTML = "";
    //   modBtns.innerHTML = "";
    //   modText.insertAdjacentHTML("afterbegin", `<p>Amount to Pay:</p>`);
    //   modImg.insertAdjacentHTML(
    //     "afterbegin",
    //     `  <p class="modal__img_text">₱${price}</p>`
    //   );
    //   modBtns.insertAdjacentHTML(
    //     "afterbegin",
    //     `<button class="btn btn__main btnSubmit">Print</button>
    //   <button class="btn closeModal">Cancel</button>`
    //   );
    //   // generate buttons inside the dialog
    //   const btnSubmit = document.querySelector(".btnSubmit");
    //   const closeModal = document.querySelector(".closeModal");
    //   closeModal.addEventListener("click", () => {
    //     modal.close();
    //   });
    //   //checks Wallet if enough balance for File
    //   const isWalletEnoughBal = () => (walletBal >= priceFile ? true : false);
    //   //listen for clicking print button inside dialog
    //   btnSubmit.addEventListener("click", async () => {
    //     modText.innerHTML = "";
    //     modImg.innerHTML = "";
    //     modBtns.innerHTML = "";
    //     if (!isWalletEnoughBal()) {
    //       modText.insertAdjacentHTML(
    //         "afterbegin",
    //         `<p>Insufficient Balance!</p>`
    //       );
    //       modImg.insertAdjacentHTML(
    //         "afterbegin",
    //         `<p>Please load at the nearest provider.</p>`
    //       );
    //       modBtns.insertAdjacentHTML(
    //         "afterbegin",
    //         `<button class="btn closeModal">Close</button>`
    //       );
    //       // NOTE: DUPLICATE CODE FOR LISTENER
    //       const closeModal = document.querySelector(".closeModal");
    //       closeModal.addEventListener("click", () => modal.close());
    //     } else {
    //       modText.insertAdjacentHTML(
    //         "afterbegin",
    //         `<p>Generating file pin code...</p>`
    //       );
    //       modImg.insertAdjacentHTML(
    //         "afterbegin",
    //         `<img src="${printerloading}" alt="Printing Image" />`
    //       );
    //       //get file pincode, returns pincode of file
    //       //NOTE: USE TRY CATCH FOR ERROR
    //       const getPincodeForm = await PrintForm.createInstance(
    //         printForm.file.files[0],
    //         printForm.select_colored.value,
    //         printForm.select_paper.value
    //       );
    //       modText.innerHTML = "";
    //       modImg.innerHTML = "";
    //       modBtns.innerHTML = "";
    //       modText.insertAdjacentHTML(
    //         "afterbegin",
    //         `<p>
    //         Please proceed to the machine and enter this code to get your
    //         document:
    //       </p>`
    //       );
    //       modImg.insertAdjacentHTML(
    //         "afterbegin",
    //         generatePinCodeMarkup(getPincodeForm)
    //       );
    //       modBtns.insertAdjacentHTML(
    //         "afterbegin",
    //         `<button class="btn closeModal">Close</button>`
    //       );
    //       // NOTE: DUPLICATE CODE FOR LISTENER
    //       const closeModal = document.querySelector(".closeModal");
    //       closeModal.addEventListener("click", () => modal.close());

    //       //AFTER SUBMITTING PRINT FORM
    //       printForm.reset();
    //       fileLabel.textContent = "Upload a PDF file";
    //       mywalletBal.textContent = `₱${(walletBal - priceFile).toFixed(2)}`;
    //       document.querySelector(".loader").innerHTML = "";

    //       //returns markup of pincode
    //       function generatePinCodeMarkup(pincode) {
    //         console.log(pincode);
    //         console.log(typeof pincode);
    //         return pincode
    //           .split("")
    //           .map((digit) => `<p class="code">${digit}</p>`)
    //           .join("");
    //       }
    //     }
    //   });
    // }
  }
  async renderPrintFormDialog() {
    const modImg = document.querySelector(".modal__img");
    //show Price Dialog
    this.modal.showModal();
    this.renderSpinner(this.modal);
    const priceFile = await PrintForm._generatePriceAmount(
      this.printForm.file.files[0],
      this.printForm.select_paper.value,
      this.printForm.select_colored.value,
      true
    );
    this.showPrintFormPriceDialog(priceFile);
  }
  showPrintFormPriceDialog(price) {
    const priceDialogMarkup = `
      <div class="modal__section modal__text">
        <p>Amount to Pay:</p>
      </div>
      <div class="modal__section modal__img">
        <p class="modal__img_text">₱${price}</p>
      </div>
      <div class="modal__section modal__btns">
        <button class="btn btn__main btnSubmit">Print</button>
        <button class="btn closeModal">Cancel</button>
      </div>`;
    this._clear(this.modal);
    this.modal.insertAdjacentHTML("afterbegin", priceDialogMarkup);
    //generate buttons inside the dialog
    const btnSubmit = document.querySelector(".btnSubmit");
    const closeModal = document.querySelector(".closeModal");
    this.modalcloselistener(closeModal);
    // if wallet
    btnSubmit.addEventListener("click", async () => {
      this._clear(this.modal);
      await this.showPrintFormSubmitDialog(this.paymentOption);
    });
  }
  //NOTE: override this function for useradmin with wallet
  async showPrintFormSubmitDialog(paymentOption) {
    try {
      const gettingPincodeMarkup = `
      <div class="modal__section modal__text">
        <p>Generating file pin code...</p>
      </div>
      <div class="modal__section modal__img">
        <img src="${printerloading}" alt="Printing Image" />
      </div>`;
      this._clear(this.modal);
      this.modal.insertAdjacentHTML("afterbegin", gettingPincodeMarkup);
      const getPincodeForm = await PrintForm.createInstance(
        this.printForm.file.files[0],
        this.printForm.select_colored.value,
        this.printForm.select_paper.value,
        this.printForm.select_payment.value
      );
      this._clear(this.modal);
      const pincodeMarkup = `
      <div class="modal__section modal__text">
        <p>Please proceed to the machine and enter this to get your document:</p>
      </div>
      <div class="modal__section modal__img">
        <p class="modal__img_text">${generatePinCodeMarkup(getPincodeForm)}</p>
      </div>
      <div class="modal__section modal__btns">
        <button class="btn closeModal">Close</button>
      </div>`;
      this._clear(this.modal);
      this.modal.insertAdjacentHTML("afterbegin", pincodeMarkup);
      //AFTER SUBMITTING PRINT FORM
      this.printForm.reset();
      this.fileLabel.textContent = "Upload a PDF file";
      document.querySelector(".errormsg").innerHTML = "";
      //returns markup of pincode
      function generatePinCodeMarkup(pincode) {
        console.log(pincode);
        return pincode
          .split("")
          .map((digit) => `<p class="code">${digit}</p>`)
          .join("");
      }
    } catch (e) {
      throw e;
    }
  }
  modalcloselistener(closeModal) {
    closeModal.addEventListener("click", () => {
      this.modal.close();
    });
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
  _clear(parentEl) {
    parentEl.innerHTML = "";
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
    parentEl.insertAdjacentHTML(
      "afterbegin",
      `<div class = "errormsg">${error}</div>`
    );
  }
}
