import logo from "../img/Pay-U-Print-logo.png";
import icons from "../img/icons.svg";
import { auth, getUserDetails, isAdmin } from "./firebaseConfig";
import PrintForm from "./printForms";
import userPanel from "./userPanel";
import loginPanel from "./login";

// const btn = document.querySelector(".btn1");
// const close = document.querySelector(".close");
// const modal = document.querySelector(".modal");
// btn.addEventListener("click", () => {
//   modal.showModal();
// });
// close.addEventListener("click", () => {
//   modal.close();
// });
init();
export async function initPanel() {
  console.log(getUserDetails());
  // NEW using class
  // const admin = await isAdmin();
  const admin = false;
  document.body.innerHTML = "";
  if (admin) {
  } else {
    userPanel.renderHeader(userPanel._header);
    userPanel.renderPrintForm();
  }
}
function init() {
  loginPanel.renderLogin(loginPanel._loginMarkup);

  // document.body.innerHTML = "";
  // console.log(await isAdmin());
  // await generateMarkupPanel(await isAdmin());
  // printFormAddListener();
}

//old VERSION
// function printFormAddListener() {
//   const printForm = document.querySelector(".printForm");
//   const fileInput = printForm.querySelector("#file");
//   const fileLabel = printForm.querySelector(".file_label");
//   fileInput.addEventListener("change", function () {
//     const selectedFile = this.files[0];
//     fileLabel.textContent = selectedFile.name;
//   });
//   printForm.addEventListener("submit", (e) => {
//     e.preventDefault();
//     if (!printForm.file.files[0]) return alert("No files uploaded yet!");
//     console.log(printForm.file.files[0]);
//     console.log(printForm.select_paper.value);
//     console.log(printForm.select_colored.value);
//   });
// }
// //NOTE: add user class to get all users data
// async function generateMarkupPanel(admin = false) {
//   if (admin) {
//     const markupPanel = ``;
//   } else {
//     const markupPanel = ` <header class="header panel_user">
//   <img
//     class="header__login_logo"
//     src="./src/img/Pay-U-Print-logo.png"
//     alt="Pay-U-Print Logo"
//   />
//   <nav class="nav">
//     <ul class="nav__list">
//       <li><button class="nav__btn">Upload</button></li>
//       <li><button class="nav__btn">History</button></li>
//       <li><button class="nav__btn">Logout</button></li>
//     </ul>
//   </nav>
// </header>
// <main>
//   <div class="container print_section">
//     <div class="printForm__text">Hello, PUPian!</div>
//     <div class="wallet">
//       <p class="wallet__text">Available Balance</p>
//       <div class="wallet__balance">₱547.20</div>
//     </div>
//     <form class="printForm">
//       <div class="printForm__text">Upload your Document</div>
//       <!-- file/document -->
//       <div class="printForm__file">
//         <label for="file" class="printForm__file_label">
//           <svg>
//             <use href="#"></use>
//           </svg>
//           <p>Upload a PDF</p>
//         </label>
//       </div>
//       <input
//         type="file"
//         name="file"
//         id="file"
//         class="printForm__file_up"
//         multiple
//         required
//       />

//       <!-- paper size -->
//       <div class="printForm__paper">
//         <label for="select-where">Paper size</label>
//         <select id="select-where" name="select-where" required>
//           <option value="">Choose one option:</option>
//           <option value="Colored">Colored</option>
//           <option value="Grayscale">Grayscale</option>
//         </select>
//       </div>

//       <!-- colored -->
//       <div class="printForm__colored">
//         <label for="select-where">Color</label>
//         <select id="select-where" name="select-where" required>
//           <option value="">Choose one option:</option>
//           <option value="Colored">Colored</option>
//           <option value="Grayscale">Grayscale</option>
//         </select>
//       </div>
//       <div><button>Submit</button></div>
//     </form>
//   </div>
//     </main>`;
//   }

//   document.body.insertAdjacentHTML("afterbegin", markupPanel);
// }
