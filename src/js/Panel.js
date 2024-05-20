import icons from "../img/icons.svg";
import printerloading from "../img/printerloading.gif";
import PrintForm from "./printForms";
import { DataProcessor } from "./fileProcess";
import { getPrinterConfig } from "./firebaseConfig";

export default class Panel {
  _parentEl;
  generatePrintFormMarkup(printer) {
    // console.log(user); NOTE: make an object and set it to ${} so without signing in is ok! or divide wallet section
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
              <p class="file_label">Upload a PDF/JPG/PNG file
              </p>
            </label>
            <input
              type="file"
              name="file"
              id="file"
              class="printForm__file_upload"
              accept="application/pdf, image/jpeg, image/png"
            />
          </div>
        </div>
        <!-- paper size -->
        <div class="printForm__section">
          <label for="select-paper">Paper size</label>
          <select id="select-paper" name="select_paper" required disabled>
          <option value="short">Short (8.5" x 11") - ₱${
            printer.priceShort
          }</option>
          <option value="long">Long (8.5" x 13") - ₱${
            printer.priceLong
          }</option>
            <option value="a4">A4 (8.3" x 11.7") - ₱${printer.priceA4}</option>
          </select>
        </div>
        <!-- colored -->
        <div class="printForm__section">
          <label for="select-colored">Color</label>
          <select id="select-colored" name="select_colored" required disabled>
            <option value="original">Original +(₱${
              printer.colorPercentageLow
            } - ₱${printer.colorPercentageHigh})</option>
            <option value="photo">Photo +(₱${printer.colorPercentageLow} - ₱${
      printer.colorPercentageHigh
    })</option>
            <option value="docs">Docs +(₱${printer.colorPercentageLow} - ₱${
      printer.colorPercentageHigh
    })</option>
            <option value="grayscale">Grayscale</option>
          </select>
        </div>
        <!-- payment option -->
        <div class="printForm__section">
          <label for="select-payment">Payment Option</label>
          <select id="select-payment" name="select_payment" required disabled>
            <option value="machine">At the Machine</option>
            <option value="wallet"  ${
              this.uid ? "" : "disabled"
            }>E-wallet</option>
          </select>
        </div>
        <div class="submit"><button type="button" class="openDialog">Submit</button></div>
      </form> 
        <!-- DIALOG -->
        <dialog class="modal">
        </dialog>
        <input type="number" id="contrast" placeholder="Enter contrast">;
        <input type="number" id="brightness" placeholder="Enter brightness">;
        <input type="number" id="saturation" placeholder="Enter saturation">`;
  }

  async renderPrintForm() {
    //NOTE: crashing when user logs in because of spinner
    this.renderSpinner(this._parentEl.children[0].children[2].children[1]);
    this.printer = await getPrinterConfig("printer1");
    this._clear(this._parentEl.children[0].children[2].children[1]);
    const printFormMarkup = this.generatePrintFormMarkup(this.printer);
    this._parentEl.insertAdjacentHTML("beforeend", printFormMarkup);
    this.addPrintFormListener();
  }
  addPrintFormListener() {
    this.modal = document.querySelector(".modal");
    this.printForm = document.querySelector(".printForm");
    const selectColored = document.getElementById("select-colored");
    const selectPaper = document.getElementById("select-paper");
    const selectPayment = document.getElementById("select-payment");
    this.errorEl = document.querySelector(".errormsg");
    const fileInput = this.printForm.querySelector("#file");
    this.fileLabel = this.printForm.querySelector(".file_label");
    const fileLabel = document.querySelector(".file_label");
    let myFile;
    const openDialog = this.printForm.querySelector(".openDialog");
    let mySelectedFile;
    const printer = this.printer;
    fileInput.addEventListener("change", async function () {
      //need to be function() to get this
      try {
        console.log(this.files);
        document.querySelector(".canvas_container").innerHTML = "";
        const selectedFile = this.files[0];
        console.log(selectedFile);
        //25 MB×1024 KB/MB×1024 Bytes/KB=6,186,598  -> NETLIFY LIMIT 6MB
        if (selectedFile?.name) {
          fileLabel.textContent = selectedFile.name;
          myFile = new DataProcessor(selectedFile, printer);
          console.log(myFile);
          await myFile.checkFile(selectedFile);
          mySelectedFile = selectedFile;
          // await DataProcessor.loadbytes(selectedFile);
          selectColored.disabled = false;
          selectPaper.disabled = false;
          selectPayment.disabled = false;
        } else {
          selectColored.disabled = true;
          selectPaper.disabled = true;
          selectPayment.disabled = true;
          fileLabel.textContent = "Upload a PDF/JPG/PNG file";
          document.querySelector(".canvas_container").innerHTML = "";
        }
      } catch (e) {
        alert(e);
        console.log(e);
        fileLabel.textContent = "Upload a PDF/JPG/PNG file";
      }

      // DataProcessor.loadPDF(selectedFile);
    });
    selectPaper.addEventListener("change", async () => {
      this.myFile = myFile;
      console.log("changing paper!!!");
      document.querySelector(".canvas_container").innerHTML = "";
      await myFile.checkFile(mySelectedFile);
    });
    selectColored.addEventListener("change", async () => {
      this.myFile = myFile;
      console.log("changing color!!!");
      document.querySelector(".canvas_container").innerHTML = "";

      await myFile.checkFile(mySelectedFile);
    });
    // open modal after clicking submit
    openDialog.addEventListener("click", async () => {
      try {
        if (!this.printForm.file.files[0])
          throw new Error("No files uploaded yet!");
        if (
          this.printForm.select_colored.value === "" ||
          this.printForm.select_paper.value === "" ||
          this.printForm.select_payment.value === ""
        )
          throw new Error("Please ensure all form fields are completed");
        this.errorEl.innerHTML = "";
        this.myFile = myFile;
        this.paymentOption = this.printForm.select_payment.value;
        await this.renderPrintFormDialog();
      } catch (e) {
        this.renderError(this.errorEl, e);
      }
    });
  }
  async renderPrintFormDialog() {
    const modImg = document.querySelector(".modal__img");
    //show Price Dialog
    this.modal.showModal();
    this.renderSpinner(this.modal);
    await this.myFile.generatePriceAmount(
      this.printForm.select_paper.value,
      this.printForm.select_colored.value
    );
    this.showPrintFormPriceDialog(
      this.myFile.finalprice,
      this.myFile.finalpage
    );
  }
  showPrintFormPriceDialog(price, page) {
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
    this.modalsubmitlistener(document.querySelector(".btnSubmit"), () =>
      this.showPrintFormPaymentDialog(this.paymentOption, price, page)
    );
    this.modalcloselistener(document.querySelector(".closeModal"));
  }
  //NOTE: since e-wallet is disabled, no override needed, add only a flag
  showPrintFormPaymentDialog(paymentOption, price, page) {
    try {
      if (paymentOption === "wallet") {
        const walletMarkup = `
        <div class="modal__section modal__text">
          <p>E-Wallet Payment Confirmation:</p>
        </div>
        <div class="modal__section modal__img">
          <p class="modal__img_text_wallet">An amount of ₱${price} will be deducted from your account. Proceed?</p>
        </div>
        <div class="modal__section modal__btns">
          <button class="btn btn__main btnSubmit">Confirm</button>
          <button class="btn closeModal">Cancel</button>
        </div>`;
        this._clear(this.modal);
        this.modal.insertAdjacentHTML("afterbegin", walletMarkup);
        this.modalsubmitlistener(document.querySelector(".btnSubmit"), () =>
          this.generatePinCodeMarkup()
        );
        this.modalcloselistener(document.querySelector(".closeModal"));
      } else {
        this.generatePinCodeMarkup(price, page);
      }
    } catch (e) {
      throw e;
    }
  }
  async generatePinCodeMarkup(price, page) {
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
      this.printForm.select_payment.value,
      price,
      page
    );
    this._clear(this.modal);
    const pincodeMarkup = `
    <div class="modal__section modal__text">
      <p>Please proceed to the machine and enter this to get your document:</p>
    </div>
    <div class="modal__section modal__img">
      <p class="modal__img_text">${formatPincode(getPincodeForm)}</p>
    </div>
    <div class="modal__section modal__btns">
      <button class="btn closeModal">Close</button>
    </div>`;
    this._clear(this.modal);
    this.modal.insertAdjacentHTML("afterbegin", pincodeMarkup);
    this.modalcloselistener(document.querySelector(".closeModal"));

    //AFTER SUBMITTING PRINT FORM
    this.printForm.reset();
    this.fileLabel.textContent = "Upload a PDF file";
    //returns markup of pincode
    function formatPincode(pincode) {
      console.log(pincode);
      return pincode
        .split("")
        .map((digit) => `<p class="code">${digit}</p>`)
        .join("");
    }
  }
  modalsubmitlistener(btnSubmit, handler) {
    btnSubmit.addEventListener("click", async () => {
      this._clear(this.modal);
      handler();
    });
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
