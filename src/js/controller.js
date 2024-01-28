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

const sampledata = [
  {
    filename: "CE-4TH-Year-Presidents-Listers.pdf",
    filepincode: "0016",
    papersize: "short",
    timestamp: {
      seconds: 1706416895,
      nanoseconds: 32000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "Chapter 6 Exercises - Transfer Function.pdf",
    filepincode: "0015",
    papersize: "short",
    timestamp: {
      seconds: 1706416674,
      nanoseconds: 334000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "Chapter 6 Exercises - Transfer Function.pdf",
    filepincode: "0014",
    papersize: "short",
    timestamp: {
      seconds: 1706415305,
      nanoseconds: 754000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "CMPE30174_Computer_Networks_and_Security_With_CoverPage.pdf",
    filepincode: "0013",
    papersize: "short",
    timestamp: {
      seconds: 1706402961,
      nanoseconds: 122000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "CNS-Midterms.pdf",
    filepincode: "0012",
    papersize: "short",
    timestamp: {
      seconds: 1706401939,
      nanoseconds: 9000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "CMPE30174_Computer_Networks_and_Security_With_CoverPage.pdf",
    filepincode: "0009",
    papersize: "short",
    timestamp: {
      seconds: 1706361650,
      nanoseconds: 100000000,
    },
    status: "Ready for Printing",
  },
  {
    filename:
      "CMPE 30184 - Module 1 - Overview of  Microcontrollers and Microcontrollers.pdf",
    filepincode: "0008",
    papersize: "short",
    timestamp: {
      seconds: 1706361367,
      nanoseconds: 231000000,
    },
    status: "Ready for Printing",
  },
  {
    filename:
      "CMPE 30184 - Module 1 - Overview of  Microcontrollers and Microcontrollers.pdf",
    filepincode: "0007",
    papersize: "short",
    timestamp: {
      seconds: 1706361344,
      nanoseconds: 46000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "MP6 - Frequency Response and Passive Filters using Multisim.pdf",
    filepincode: "0006",
    papersize: "short",
    timestamp: {
      seconds: 1706360748,
      nanoseconds: 263000000,
    },
    status: "Ready for Printing",
  },
  {
    filename:
      "CMPE 30184 - Module 1 - Overview of  Microcontrollers and Microcontrollers.pdf",
    filepincode: "0005",
    papersize: "short",
    timestamp: {
      seconds: 1706360024,
      nanoseconds: 119000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "Chapter 6 Exercises - Transfer Function.pdf",
    filepincode: "0004",
    papersize: "short",
    timestamp: {
      seconds: 1706359527,
      nanoseconds: 967000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "CE-4TH-Year-Presidents-Listers.pdf",
    filepincode: "0016",
    papersize: "short",
    timestamp: {
      seconds: 1706416895,
      nanoseconds: 32000000,
    },
    status: "Done",
  },
  {
    filename: "Chapter 6 Exercises - Transfer Function.pdf",
    filepincode: "0015",
    papersize: "short",
    timestamp: {
      seconds: 1706416674,
      nanoseconds: 334000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "Chapter 6 Exercises - Transfer Function.pdf",
    filepincode: "0014",
    papersize: "short",
    timestamp: {
      seconds: 1706415305,
      nanoseconds: 754000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "CMPE30174_Computer_Networks_and_Security_With_CoverPage.pdf",
    filepincode: "0013",
    papersize: "short",
    timestamp: {
      seconds: 1706402961,
      nanoseconds: 122000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "CNS-Midterms.pdf",
    filepincode: "0012",
    papersize: "short",
    timestamp: {
      seconds: 1706401939,
      nanoseconds: 9000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "CMPE30174_Computer_Networks_and_Security_With_CoverPage.pdf",
    filepincode: "0009",
    papersize: "short",
    timestamp: {
      seconds: 1706361650,
      nanoseconds: 100000000,
    },
    status: "Ready for Printing",
  },
  {
    filename:
      "CMPE 30184 - Module 1 - Overview of  Microcontrollers and Microcontrollers.pdf",
    filepincode: "0008",
    papersize: "short",
    timestamp: {
      seconds: 1706361367,
      nanoseconds: 231000000,
    },
    status: "Ready for Printing",
  },
  {
    filename:
      "CMPE 30184 - Module 1 - Overview of  Microcontrollers and Microcontrollers.pdf",
    filepincode: "0007",
    papersize: "short",
    timestamp: {
      seconds: 1706361344,
      nanoseconds: 46000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "MP6 - Frequency Response and Passive Filters using Multisim.pdf",
    filepincode: "0006",
    papersize: "short",
    timestamp: {
      seconds: 1706360748,
      nanoseconds: 263000000,
    },
    status: "Ready for Printing",
  },
  {
    filename:
      "CMPE 30184 - Module 1 - Overview of  Microcontrollers and Microcontrollers.pdf",
    filepincode: "0005",
    papersize: "short",
    timestamp: {
      seconds: 1706360024,
      nanoseconds: 119000000,
    },
    status: "Ready for Printing",
  },
  {
    filename: "Chapter 6 Exercises - Transfer Function.pdf",
    filepincode: "0004",
    papersize: "short",
    timestamp: {
      seconds: 1706359527,
      nanoseconds: 967000000,
    },
    status: "Ready for Printing",
  },
];

let currentPage = 1;
const rowsPerPage = 5;
const totalPages = Math.ceil(sampledata.length / rowsPerPage);

function displayPage(page) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = sampledata.slice(start, end);

  const tbody = document
    .getElementById("data-table")
    .getElementsByTagName("tbody")[0];
  tbody.innerHTML = ""; // Clear existing rows

  pageData.forEach((item) => {
    let row = tbody.insertRow();
    row.innerHTML = `
    <td class="text-overflow">${item.filename}</td>
        <td class="center-text">${item.filepincode}</td>
        <td class="center-text">${item.papersize}</td>
        <td class="center-text">${formatTimeStamp(item.timestamp)}</td>
        <td class="center-text">${item.status}</td>
        `;
  });

  document.getElementById("currentPage").textContent = page;
  updateButtonStatus();
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
function updateButtonStatus() {
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayPage(currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    displayPage(currentPage);
  }
});

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
