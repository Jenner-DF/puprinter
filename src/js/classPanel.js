import { doc, onSnapshot } from "firebase/firestore";
import icons from "../img/icons.svg";
import printerloading from "../img/printerloading.gif";
import PrintForm from "./printForms";
import { auth, db, getUserProfile } from "./firebaseConfig";

export default class Panel {
  generatePrintFormMarkup(user) {
    // console.log(user); NOTE: make an object and set it to ${} so without signing in is ok! or divide wallet section
    return `<div class="container print__section">
    <div class='loader'></div>
    <div class="section print__section_wallet">
      <div class="printForm__text">Hello, ${user.displayName}!</div>
      <div class="wallet">
        <p class="wallet__text">Available Balance:</p>
        <div class="wallet__balance">₱${user.wallet.toFixed(2)}</div>
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
        <div class="submit"><button type="button" class="openDialog">Submit</button></div>
      </form>
        <!-- DIALOG -->
        <dialog class="modal">
        <div class="modal__section modal__text">
        </div>
        <div class="modal__section modal__img">
        </div>
        <div class="modal__section modal__btns">
        </div>
      </dialog>
    </div>
  </div>`;
  }

  async renderPrintForm(userProfile) {
    const printFormMarkup = this.generatePrintFormMarkup(userProfile);
    document.body.children[1].innerHTML = printFormMarkup;
    this.addPrintFormListener();
  }
  addPrintFormListener() {
    const printForm = document.querySelector(".printForm");
    const loaderEl = document.querySelector(".loader");
    const fileInput = printForm.querySelector("#file");
    const fileLabel = printForm.querySelector(".file_label");
    const openDialog = printForm.querySelector(".openDialog");
    const modal = document.querySelector(".modal");
    const modText = document.querySelector(".modal__text");
    const modImg = document.querySelector(".modal__img");
    const modBtns = document.querySelector(".modal__btns");
    const mywalletBal = document.querySelector(".wallet__balance");
    fileInput.addEventListener("change", function () {
      const selectedFile = this.files[0];
      if (selectedFile.type !== "application/pdf")
        return alert("Please upload PDF file only.");
      fileLabel.textContent = selectedFile.name;
      console.log(selectedFile);
    });
    // open modal after clicking submit
    openDialog.addEventListener("click", async () => {
      try {
        if (!printForm.file.files[0]) throw new Error("No files uploaded yet!");
        if (printForm.file.files[0].type !== "application/pdf")
          throw new Error("Please upload PDF file only.");
        if (
          printForm.select_colored.value === "" ||
          printForm.select_paper.value === ""
        )
          throw new Error(
            "Please ensure all form fields are accurately completed"
          );
        modal.showModal();
        //show Price Dialog
        this.renderSpinner(modImg);
        this.priceFile = await PrintForm._generatePriceAmount(
          printForm.file.files[0],
          printForm.select_paper.value,
          printForm.select_colored.value,
          true
        );
        this._clear(modImg);
        this.renderSpinner(modImg);
        const wallet = await getUserProfile(auth.currentUser.uid);
        console.log(wallet.wallet);
        showPriceDialog(this.priceFile, wallet.wallet);
      } catch (e) {
        this.renderError(loaderEl, e);
      }
    });
    function showPriceDialog(price, wallet) {
      const priceFile = price;
      const walletBal = wallet;
      modText.innerHTML = "";
      modImg.innerHTML = "";
      modBtns.innerHTML = "";
      modText.insertAdjacentHTML("afterbegin", `<p>Amount to Pay:</p>`);
      modImg.insertAdjacentHTML(
        "afterbegin",
        `  <p class="modal__img_text">₱${price}</p>`
      );
      modBtns.insertAdjacentHTML(
        "afterbegin",
        `<button class="btn btn__main btnSubmit">Print</button>
      <button class="btn closeModal">Cancel</button>`
      );
      // generate buttons inside the dialog
      const btnSubmit = document.querySelector(".btnSubmit");
      const closeModal = document.querySelector(".closeModal");
      closeModal.addEventListener("click", () => {
        modal.close();
      });
      //checks Wallet if enough balance for File
      const isWalletEnoughBal = () => (walletBal >= priceFile ? true : false);
      //listen for clicking print button inside dialog
      btnSubmit.addEventListener("click", async () => {
        modText.innerHTML = "";
        modImg.innerHTML = "";
        modBtns.innerHTML = "";
        if (!isWalletEnoughBal()) {
          modText.insertAdjacentHTML(
            "afterbegin",
            `<p>Insufficient Balance!</p>`
          );
          modImg.insertAdjacentHTML(
            "afterbegin",
            `<p>Please load at the nearest provider.</p>`
          );
          modBtns.insertAdjacentHTML(
            "afterbegin",
            `<button class="btn closeModal">Close</button>`
          );
          // NOTE: DUPLICATE CODE FOR LISTENER
          const closeModal = document.querySelector(".closeModal");
          closeModal.addEventListener("click", () => modal.close());
        } else {
          modText.insertAdjacentHTML(
            "afterbegin",
            `<p>Generating file pin code...</p>`
          );
          modImg.insertAdjacentHTML(
            "afterbegin",
            `<img src="${printerloading}" alt="Printing Image" />`
          );
          //get file pincode, returns pincode of file
          //NOTE: USE TRY CATCH FOR ERROR
          const getPincodeForm = await PrintForm.createInstance(
            printForm.file.files[0],
            printForm.select_colored.value,
            printForm.select_paper.value
          );
          modText.innerHTML = "";
          modImg.innerHTML = "";
          modBtns.innerHTML = "";
          modText.insertAdjacentHTML(
            "afterbegin",
            `<p>
            Please proceed to the machine and enter this code to get your
            document:
          </p>`
          );
          modImg.insertAdjacentHTML(
            "afterbegin",
            generatePinCodeMarkup(getPincodeForm)
          );
          modBtns.insertAdjacentHTML(
            "afterbegin",
            `<button class="btn closeModal">Close</button>`
          );
          // NOTE: DUPLICATE CODE FOR LISTENER
          const closeModal = document.querySelector(".closeModal");
          closeModal.addEventListener("click", () => modal.close());

          //AFTER SUBMITTING PRINT FORM
          printForm.reset();
          fileLabel.textContent = "Upload a PDF file";
          mywalletBal.textContent = `₱${(walletBal - priceFile).toFixed(2)}`;
          document.querySelector(".loader").innerHTML = "";

          //returns markup of pincode
          function generatePinCodeMarkup(pincode) {
            console.log(pincode);
            console.log(typeof pincode);
            return pincode
              .split("")
              .map((digit) => `<p class="code">${digit}</p>`)
              .join("");
          }
        }
      });
    }
  }
  generateUserHistoryMarkup(data) {
    //NOTE: merge history of admin and user, set flags to get which data is displayed
    const trows = data
      .map(
        (data) =>
          `<tr>
          <td class="text-overflow">${data.filename}</td>
          <td class="center-text">${data.filepincode}</td>
          <td class="center-text capitalize">${data.paperType}</td>
          <td class="center-text capitalize">${data.colorOption}</td>
          <td class="center-text">${this.formatTimeStamp(data.timestamp)}</td>
          <td class="center-text">${data.status}</td>
          </tr>`
      )
      .join("");
    return `<div class="container table-container">
    <table id="data-table">
      <thead>
        <tr>
        <th>Filename</th>
        <th class="center-text">File Pincode</th>
        <th class="center-text">Paper Type</th>
        <th class="center-text">Color Option</th>
        <th class="center-text">Date Uploaded</th>
        <th class="center-text">Status</th>
        </tr>
      </thead>
      <tbody>
        ${trows}
      </tbody>
    </table>
  </div>
  <!--<div id="pagination">
    <button id="prevPage">Previous</button>
    <span id="currentPage">1</span>
    <button id="nextPage">Next</button>
  </div> -->`;
  }

  async renderHistory(userProfile) {
    this._pastDocs = JSON.parse(userProfile.history);

    // NOTE: it works because it is still under new userPanel()
    const allDocs = [...this._activeDocs, ...this._pastDocs];
    console.log(allDocs);
    document.body.children[1].innerHTML =
      this.generateUserHistoryMarkup(allDocs); //NOTE: VIEW ONLY
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
