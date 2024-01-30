import {
  auth,
  getUserDetails,
  getUserProfile,
  isAdmin,
  userSignOut,
  collection,
  getDocs,
  db,
  query,
  orderBy,
} from "./firebaseConfig";
import userPanel from "./userPanel";
import loginPanel from "./login";
import { onAuthStateChanged, signOut } from "firebase/auth";
import icons from "../img/icons.svg";
import adminPanel from "./adminPanel";

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
const mydata = [
  {
    filename: "FERN.pdf",
    filepincode: "0005",
    papersize: "short",
    timestamp: {
      seconds: 1706517994,
      nanoseconds: 487000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "bondad_teluk.pdf",
    filepincode: "0004",
    papersize: "short",
    timestamp: {
      seconds: 1706517969,
      nanoseconds: 298000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "Chapter 6 Exercises - Transfer Function.pdf",
    filepincode: "0003",
    papersize: "short",
    timestamp: {
      seconds: 1706517535,
      nanoseconds: 170000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "testFile.pdf",
    filepincode: "0002",
    papersize: "",
    timestamp: {
      seconds: 1706517147,
      nanoseconds: 334000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "testFile.pdf",
    filepincode: "0001",
    papersize: "long",
    timestamp: {
      seconds: 1706516967,
      nanoseconds: 417000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "HISTORY 2",
    filepincode: "0019",
    papersize: "short",
    timestamp: {
      seconds: 1706459393,
      nanoseconds: 647000000,
    },
    status: "Ready for Printing",
  },
];
function generateHistoryMarkup(data, admin = false) {
  const trows = data
    .map(
      (data) =>
        `<tr><td class="text-overflow">${
          data.filename
        }</td><td class="center-text">${
          data.filepincode
        }</td><td class="center-text capitalize">${
          data.papersize
        }</td><td class="center-text">${formatTimeStamp(
          data.timestamp
        )}</td><td class="center-text">${data.status}</td></tr>`
    )
    .join("");
  return `<div class="container table-container">
  <table id="data-table">
    <thead>
      <tr>
      <th>Filename</th>
      <th class="center-text">File Pincode</th>
      <th class="center-text">Paper Size</th>
      <th class="center-text">Timestamp</th>
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
async function renderHistory(data, admin = false) {
  // this._pastDocs = JSON.parse(userProfile.history);

  // NOTE: it works because it is still under new userPanel()
  // const allDocs = [...this._activeDocs, ...this._pastDocs];
  // console.log(allDocs);
  document.body.innerHTML = generateHistoryMarkup(data, admin);
  console.log(document.body.innerHTML);
  //NOTE: VIEW ONLY
  // this.addRenderHistoryListener(allDocs);
}
function formatTimeStamp(timestamp) {
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

// renderHistory(mydata);

//BUG:
// function genHisto(data) {
//   const trows = data
//     .map(
//       (data) =>
//         `<tr>
//         <td class="text-overflow">${data.userID}</td>
//         <td class="center-text text-overflow">${data.filename}</td>
//         <td class="center-text">${data.filepincode}</td>
//         <td class="center-text">${data.price}</td>
//         <td class="center-text">${data.colored}</td>
//         <td class="center-text">${data.papersize}</td>
//         <td class="center-text">08-11-2024 </td>
//         <td class="center-text text-overflow">${data.fileUrl}</td>
//         <td class="center-text">${data.status}</td>
//         </tr>`
//     )
//     .join("");
//   return `<div class="container table-container">
//   <table id="data-table">
//     <thead>
//       <tr>
//       <th class="center-text">User ID</th>
//       <th class="center-text">File Name</th>
//       <th class="center-text">File PIN Code</th>
//       <th class="center-text">Price</th>
//       <th class="center-text">Print Color</th>
//       <th class="center-text">Paper Size</th>
//       <th class="center-text">Timestamp</th>
//       <th class="center-text">File URL</th>
//       <th class="center-text">Status</th>
//       </tr>
//     </thead>
//     <tbody>
//       ${trows}
//     </tbody>
//   </table>
// </div>
// <!--<div id="pagination">
//   <button id="prevPage">Previous</button>
//   <span id="currentPage">1</span>
//   <button id="nextPage">Next</button>
// </div> -->`;
// }
// async function it() {
//   const q = query(collection(db, "printForms"), orderBy("timestamp", "desc"));
//   const snapshot = await getDocs(q);
//   const activeDocs = snapshot.docs.map((doc) => ({
//     userID: doc.data().userID,
//     filename: doc.data().filename,
//     fileUrl: doc.data().fileURL,
//     filepincode: doc.data().filePinCode,
//     colored: doc.data().colored,
//     papersize: doc.data().paperSize,
//     price: doc.data().price,
//     status: doc.data().status,
//     timestamp: doc.data().timestamp,
//   }));
//   document.body.innerHTML = genHisto(activeDocs);
// }
// it();

//BUG:
// NOTE: APP;
const spinner = ` <div class="spinner">
<svg>
  <use href="${icons}#icon-loader"></use>
</svg>
</div>`;
onAuthStateChanged(auth, async (user) => {
  document.body.insertAdjacentHTML("afterbegin", "");
  document.body.insertAdjacentHTML("afterbegin", spinner);
  document.body.innerHTML = "";
  document.body.innerHTML = spinner;
  if (user) {
    console.log(user);
    const admin = await getUserProfile(user.uid);
    console.log(admin.isAdmin);
    //NOTE: NO ADMIN PAGE YET!
    admin.isAdmin
      ? new adminPanel(user.uid, admin.isAdmin)
      : new userPanel(user.uid, admin.isAdmin);
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
