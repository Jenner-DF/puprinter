import icons from "../img/icons.svg";
import printerloading from "../img/printerloading.gif";
import PrintForm from "./printForms";
import { DataProcessor } from "./fileProcess";
import { addIssueForm, getPrinterConfig } from "./firebaseConfig";

export default class Panel {
  _parentEl;
  generatePrintFormMarkup(printer) {
    // console.log(user); NOTE: make an object and set it to ${} so without signing in is ok! or divide wallet section
    // Generate table headers dynamically based on grayscale and color thresholds
    const thresholds = JSON.parse(printer.thresholds);
    // Filter out thresholds with minPercentage = 0 for both grayscale and color
    const filteredGrayscale = thresholds.grayscale.filter(
      (threshold) => threshold.minPercentage !== 0
    );
    const filteredColor = thresholds.color.filter(
      (threshold) => threshold.minPercentage !== 0
    );

    // Reverse the filtered thresholds for descending order
    const reversedGrayscale = filteredGrayscale.slice().reverse();
    const reversedColor = filteredColor.slice().reverse();

    // Generate table headers dynamically based on reversed grayscale and color thresholds
    const grayscaleHeaders = reversedGrayscale
      .map((threshold) => `<th>&gt;${threshold.minPercentage}%</th>`)
      .join("");
    const colorHeaders = reversedColor
      .map((threshold) => `<th>&gt;${threshold.minPercentage}%</th>`)
      .join("");

    // Generate table data for grayscale and color thresholds
    const grayscaleData = reversedGrayscale
      .map((threshold) => `<td>+${threshold.additionalPrice}</td>`)
      .join("");
    const colorData = reversedColor
      .map((threshold) => `<td>+${threshold.additionalPrice}</td>`)
      .join("");
    const colorDataLong = reversedColor
      .map((threshold) => `<td>+${threshold.longPrice}</td>`)
      .join("");
    ` <table border="1">
          <tr>
            <td></td>
            <th rowspan="2">BASE PRICE</th>
            <th colspan="${reversedGrayscale.length}">BLACK</th>
            <th colspan="${reversedColor.length}">COLOR</th>
          </tr>
          <tr>
            <td></td>
            ${grayscaleHeaders}
            ${colorHeaders}
          </tr>
          <tr>
            <th>SHORT</th>
            <td>2</td>
            ${grayscaleData}
            ${colorData}
          </tr>
          <tr>
            <th>A4</th>
            <td>2</td>
            ${grayscaleData}
            ${colorData}
          </tr>
          <tr>
            <th>LONG</th>
            <td>3</td>
            ${grayscaleData}
            ${colorDataLong}
          </tr>
        </table>`;
    // Construct the table HTML
    return `
    <div class="priceTable">
      <h2>Price Guide (per page): </h2>
      <div> 
        <table border="1">
          <tr>
            <td></td>
            <th rowspan="2">BASE PRICE</th>
            <th colspan="${reversedGrayscale.length}">BLACK</th>
          </tr>
          <tr>
            <td></td>
            ${grayscaleHeaders}
          </tr>
          <tr>
            <th>SHORT</th>
            <td>2</td>
            ${grayscaleData}
          </tr>
          <tr>
            <th>A4</th>
            <td>2</td>
            ${grayscaleData}
          </tr>
          <tr>
            <th>LONG</th>
            <td>3</td>
            ${grayscaleData}
          </tr>
        </table>
      </div>
       <div> 
        <table border="1">
          <tr>
            <td></td>
            <th rowspan="2">BASE PRICE</th>
            <th colspan="${reversedColor.length}">COLOR</th>
          </tr>
          <tr>
            <td></td>
            ${colorHeaders}
          </tr>
          <tr>
            <th>SHORT</th>
            <td>2</td>
            ${colorData}
          </tr>
          <tr>
            <th>A4</th>
            <td>2</td>
            ${colorData}
          </tr>
          <tr>
            <th>LONG</th>
            <td>3</td>
            ${colorDataLong}
          </tr>
        </table>
      </div>
       <p><strong>Note:</strong> The researchers have implemented an algorithm in order to detect the color of each page in the document.</p>
    </div>
    </div>
    
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
              <p class="file_label">Upload a PDF/JPG file
              </p>
            </label>
            <input
              type="file"
              name="file"
              id="file"
              class="printForm__file_upload" 
              multiple
              accept="application/pdf, image/jpeg"
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
            <option value="original">Original</option>
            <option value="photo">Photo</option>
            <option value="docs">Docs</option>
            <option value="grayscale">Grayscale</option>
          </select>
        </div>
        <!-- copies -->
        <div class="printForm__section">
          <label for="select-copies">Copies</label>
          <input type="number" id="select-copies" name="select-copies" min="1" max="30" value="1" disabled>
        </div>
        <!-- orientation -->
        <div class="printForm__section">
          <label for="select-payment">Orientation</label>
          <select id="select-orientation" name="select_orientation" required disabled>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
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
        <div class="download"><button disabled type="button" class="downloadPDF hidden" >Download PDF</button></div>
      </form>
      </div> 
      <div>
        <h1 style="text-align:center;padding: 10px 0">Output PDF:</h1>
        <div class="canvas_container"></div>
      </div>
      <form class="issueForm">
        <div class="issues">
          <label for="select-issue">Report an Issue:</label>
          <select id="select-issue" name="select_issue" required >
            <option value="Machine">Machine</option>
            <option value="Application">Application</option>
            <option value="Others">Others</option>
          </select>
          <textarea id="issue-comments" name="issue_comments" rows="4" cols="50" placeholder="Describe the issue in detail..."></textarea>
    </div>
    <div class="submit">
    <button type="submit" class="btn btn__main issuebtn">Report</button>
    </div>
</div>
</form>
        <!-- DIALOG -->
        <dialog class="modal">
        </dialog>
  `;
  }
  async renderPrintForm() {
    //NOTE: crashing when user logs in because of spinner
    // this.renderSpinner(this._parentEl.children[0].children[2].children[1]);
    this.renderSpinner(this._parentEl);
    this.printer = await getPrinterConfig("printer1");
    // this._clear(this._parentEl.children[0].children[2].children[1]);
    this._clear(this._parentEl);
    const printFormMarkup = this.generatePrintFormMarkup(this.printer);
    this._parentEl.insertAdjacentHTML("beforeend", printFormMarkup);
    this.addPrintFormListener();
  }
  addPrintFormListener() {
    this.issueForm = document.querySelector(".issueForm");
    this.submitIssue = document.querySelector(".issuebtn");
    this.issueForm.addEventListener("submit", (e) => e.preventDefault());

    this.submitIssue.addEventListener("click", async (e) => {
      try {
        console.log("was clicked!!!!");
        e.preventDefault();
        await addIssueForm(
          this.issueForm.select_issue.value,
          this.issueForm.issue_comments.value
        );
        alert("Report Submitted!");
      } catch (e) {
        console.log(e);
        alert(e);
      }
    });
    this.modal = document.querySelector(".modal");
    this.printForm = document.querySelector(".printForm");
    this.selectColored = document.getElementById("select-colored");
    this.selectPaper = document.getElementById("select-paper");
    this.selectPayment = document.getElementById("select-payment");
    this.selectCopies = document.getElementById("select-copies");
    this.selectOrientation = document.getElementById("select-orientation");
    this.errorEl = document.querySelector(".errormsg");
    this.fileInput = this.printForm.querySelector("#file");
    this.fileLabel = this.printForm.querySelector(".file_label");
    this.openDialog = this.printForm.querySelector(".openDialog");
    this.downloadPDF = this.printForm.querySelector(".downloadPDF");
    //prevents submission of prinform form
    this.printForm.addEventListener("submit", (e) => e.preventDefault());
    this.fileInput.addEventListener("change", async (e) => {
      try {
        const files = e.target.files;
        this._clear(this.errorEl);
        //prettier-ignore
        const filenames = Array.from(files).reduce((acc, file) => {
          acc.push(file.name);
          return acc;
        }, []);
        this.fileLabel.textContent = filenames.join(", ");
        this.myFile = new DataProcessor(files, this.printer);
        //disables file input while loading
        this.disableUserInputButtons(true);
        await this.myFile.checkFile();
        this.disableUserInputButtons(false);
      } catch (e) {
        this.disableUserInputButtons(true);
        this.renderError(this.errorEl, e);
        this.fileInput.disabled = false;
        console.log(e);
        this.fileLabel.textContent = "Upload a PDF/JPG/PNG file";
      }
    });
    this.downloadPDF.addEventListener("click", async () => {
      try {
        console.time("DOWNLOAD FILE LOADTIME:");
        await this.myFile.downloadPDF();
        console.timeEnd("DOWNLOAD FILE LOADTIME:");
      } catch (e) {
        alert(e);
        console.log(e);
        this.fileLabel.textContent = "Upload a PDF/JPG/PNG file";
      }
    });
    this.selectPaper.addEventListener("change", async () => {
      try {
        this.disableUserInputButtons(true);
        await this.myFile.checkFile();
        this.disableUserInputButtons(false);
      } catch (e) {
        this.errorEl(e);
      }
    });
    this.selectColored.addEventListener(
      "click",
      () => {
        const selectColoredMarkup = `
      <div class="modal__section modal__text">
        <p>WARNING:</p>
      </div>
      <div class="modal__section modal__img">
        <p class="modal__img_text_long">Changing color results to lower quality for PDFs (excluding grayscale)</p>
      </div>
      <div class="modal__section modal__btns">
        <button class="btn closeModal">Continue</button>
      </div>`;
        this._clear(this.modal);
        this.modal.showModal();
        this.modal.insertAdjacentHTML("afterbegin", selectColoredMarkup);
        this.modalcloselistener(document.querySelector(".closeModal"));
      },
      { once: true }
    );
    this.selectColored.addEventListener("change", async () => {
      try {
        this.disableUserInputButtons(true);
        await this.myFile.checkFile();
        this.disableUserInputButtons(false);
      } catch (e) {
        this.errorEl(e);
      }
    });
    this.selectCopies.addEventListener("change", async () => {
      try {
        console.log("changing copies!!!");
        this.disableUserInputButtons(true);
        await this.myFile.checkFile();
        this.disableUserInputButtons(false);
      } catch (e) {
        // this.selectCopies.value = 1;
        this.selectCopies.disabled = false;
        this.fileInput.disabled = false;
        this.renderError(this.errorEl, e);
        // this.fileLabel.textContent = "Upload a PDF/JPG/PNG file";
        console.log(this.myFile);
      }
    });
    this.selectOrientation.addEventListener("change", async () => {
      try {
        this.disableUserInputButtons(true);
        await this.myFile.checkFile();
        this.disableUserInputButtons(false);
      } catch (e) {
        this.errorEl(e);
      }
    });
    // open modal after clicking submit
    this.openDialog.addEventListener("click", async () => {
      try {
        this.errorEl.innerHTML = "";
        this.paymentOption = this.printForm.select_payment.value;
        await this.renderPrintFormDialog();
      } catch (e) {
        this.renderError(this.errorEl, e);
      }
    });
  }
  async renderPrintFormDialog() {
    try {
      //show Price Dialog
      this._clear(this.modal);
      this.modal.showModal();
      this.renderSpinner(this.modal);
      this.disableUserInputButtons(true);
      console.time("PRICE AMOUNT GENERATION TIME:");
      await this.myFile.checkFile(true);
      console.timeEnd("PRICE AMOUNT GENERATION TIME:");
      this.disableUserInputButtons(false);
      this.showPrintFormPriceDialog(
        this.myFile.finalprice,
        this.myFile.finalpage
      );
    } catch {
      this.renderError(this.errorEl, "No files uploaded yet!");
      this.fileInput.disabled = false;
      this.modal.close();
    }
  }
  generatePriceBreakdownMarkup() {
    console.log(this.myFile.pricePerPage);
    const markupPage = this.myFile.pricePerPage
      .map(
        (page, index) =>
          `<div class="page">
              <div class="page-number">Page ${index + 1} </div>
              <div class="page-colorPercent">Color (${
                page.colorPercent
              }%)  <span class="percent">₱${page.price}</span> </div>
            </div>`
      )
      .join("");
    const markup = `
      <div class="modal-title">Price Breakdown:</div>
      <div class="transaction">
          ${markupPage}
      </div>
      <div class="total-amount">Total: ₱${this.myFile.finalprice}</div>
      <div class="modal__section modal__btns">
      <button class="btn closeModal">Cancel</button>
      <button class="btn btn__main btnSubmit">Confirm</button>
      </div>
    `;
    return markup;
  }
  showPrintFormPriceDialog() {
    // const priceDialogMarkup = `
    //   <div class="modal__section modal__text">
    //     <p>Amount to Pay:</p>
    //   </div>
    //   <div class="modal__section modal__img">
    //     <p class="modal__img_text">₱${this.myFile.finalprice}</p>
    //   </div>
    //   <div class="modal__section modal__btns">
    //     <button class="btn btn__main btnSubmit">Print</button>
    //     <button class="btn closeModal">Cancel</button>
    //   </div>`;
    const markup = this.generatePriceBreakdownMarkup();
    this._clear(this.modal);
    this.modal.insertAdjacentHTML("afterbegin", markup);
    //generate buttons inside the dialog
    this.modalsubmitlistener(document.querySelector(".btnSubmit"), () =>
      this.showPrintFormPaymentDialog(this.paymentOption)
    );
    this.modalcloselistener(document.querySelector(".closeModal"));
  }
  //NOTE: since e-wallet is disabled, no override needed, add only a flag
  showPrintFormPaymentDialog(paymentOption) {
    try {
      if (paymentOption === "wallet") {
        const walletMarkup = `
        <div class="modal__section modal__text">
          <p>E-Wallet Payment Confirmation:</p>
        </div>
        <div class="modal__section modal__img">
          <p class="modal__img_text_wallet">An amount of ₱${this.myFile.finalprice} will be deducted from your account. Proceed?</p>
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
        this.generatePinCodeMarkup();
      }
    } catch (e) {
      throw e;
    }
  }
  async generatePinCodeMarkup() {
    const gettingPincodeMarkup = `
    <div class="modal__section modal__text">
      <p>Generating file pin code...</p>
    </div>
    <div class="modal__section modal__img">
      <img src="${printerloading}" alt="Printing Image" />
    </div>`;
    this._clear(this.modal);
    this.modal.insertAdjacentHTML("afterbegin", gettingPincodeMarkup);
    console.time("PIN CODE GENERATION TIME:");

    const getPincodeForm = await PrintForm.createInstance(
      await this.myFile.generateFinalFile(),
      this.printForm.select_colored.value,
      this.printForm.select_paper.value,
      this.printForm.select_payment.value,
      this.myFile.finalprice,
      this.myFile.finalpage
    );

    this._clear(this.modal);
    const pincodeMarkup = `
    <div class="modal__section modal__text">
      <p>Please proceed to the machine and enter this PIN to get your document:</p>
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
    console.timeEnd("PIN CODE GENERATION TIME:");

    //AFTER SUBMITTING PRINT FORM
    this.printForm.reset();
    this.fileLabel.textContent = "Upload a PDF file";
    document.querySelector(".canvas_container").innerHTML = "";

    //returns markup of pincode
    function formatPincode(pincode) {
      console.log(pincode);
      return pincode
        .split("")
        .map((digit) => `<p class="code">${digit}</p>`)
        .join("");
    }
  }

  disableUserInputButtons(state) {
    this.selectColored.disabled = state;
    this.selectPaper.disabled = state;
    this.selectPayment.disabled = state;
    this.selectOrientation.disabled = state;
    this.selectCopies.disabled = state;
    this.downloadPDF.disabled = state;
    this.fileInput.disabled = state;
    this.openDialog.disabled = state;

    state
      ? this.downloadPDF.classList.add("hidden")
      : this.downloadPDF.classList.remove("hidden");
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
