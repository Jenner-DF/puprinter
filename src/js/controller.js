import {
  auth,
  getUserDetails,
  getUserProfile,
  isAdmin,
} from "./firebaseConfig";
import userPanel from "./userPanel";
import loginPanel from "./login";
import { onAuthStateChanged, signOut } from "firebase/auth";
import icons from "../img/icons.svg";

// let currentPage = 1;
// const rowsPerPage = 5;
// const totalPages = Math.ceil(sampledata.length / rowsPerPage);

// function displayPage(page) {
//   const start = (page - 1) * rowsPerPage;
//   const end = start + rowsPerPage;
//   const pageData = sampledata.slice(start, end);

//   const tbody = document
//     .getElementById("data-table")
//     .getElementsByTagName("tbody")[0];
//   tbody.innerHTML = ""; // Clear existing rows

//   pageData.forEach((item) => {
//     let row = tbody.insertRow();
//     row.innerHTML = `
//     <td class="text-overflow">${item.filename}</td>
//         <td class="center-text">${item.filepincode}</td>
//         <td class="center-text">${item.papersize}</td>
//         <td class="center-text">${formatTimeStamp(item.timestamp)}</td>
//         <td class="center-text">${item.status}</td>
//         `;
//   });

//   document.getElementById("currentPage").textContent = page;
//   updateButtonStatus();
// }
// document.getElementById("prevPage").addEventListener("click", () => {
//   if (currentPage > 1) {
//     currentPage--;
//     displayPage(currentPage);
//   }
// });

// document.getElementById("nextPage").addEventListener("click", () => {
//   if (currentPage < totalPages) {
//     currentPage++;
//     displayPage(currentPage);
//   }
// });
// function updateButtonStatus() {
//   document.getElementById("prevPage").disabled = currentPage === 1;
//   document.getElementById("nextPage").disabled = currentPage === totalPages;
// }
// function formatTimeStamp(timestamp) {
//   const date = new Date(
//     timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
//   );
//   const formattedDate =
//     String(date.getMonth() + 1).padStart(2, "0") +
//     "-" + // Months are 0-based
//     String(date.getDate()).padStart(2, "0") +
//     "-" +
//     date.getFullYear();
//   return formattedDate;
// }

// displayPage(currentPage); // Initial display

const spinner = ` <div class="spinner">
<svg>
  <use href="${icons}#icon-loader"></use>
</svg>
</div>`;
onAuthStateChanged(auth, async (user) => {
  document.body.insertAdjacentHTML("afterbegin", "");
  document.body.insertAdjacentHTML("afterbegin", spinner);
  if (user) {
    console.log(user);
    const admin = await getUserProfile(user.uid);
    //NOTE: NO ADMIN PAGE YET!
    admin.isAdmin ? null : new userPanel(user.uid);
  } else {
    loginPanel.render();
  }
});

// initLogin();
// export function initLogin() {
//   loginPanel.render();
// }
// export async function initPanel() {
//   // console.log(getUserProfile(auth.currentUser.uid));
//   // NEW using class
//   // const admin = await isAdmin(); NO ADMIN PAGE YET
//   const admin = false;
//   if (admin) {
//     // adminPanel.render() //NO ADMIN PAGE YET
//   } else {
//     new userPanel(auth.currentUser.uid);
//   }
// }
