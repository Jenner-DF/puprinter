import {
  auth,
  getUserDetails,
  getUserProfile,
  isAdmin,
} from "./firebaseConfig";
import userPanel from "./userPanel";
import loginPanel from "./login";

initLogin();
export function initLogin() {
  loginPanel.render();
}
export async function initPanel() {
  // console.log(getUserProfile(auth.currentUser.uid));
  // NEW using class
  // const admin = await isAdmin(); NO ADMIN PAGE YET
  const admin = false;
  if (admin) {
    // adminPanel.render() //NO ADMIN PAGE YET
  } else {
    new userPanel(auth.currentUser.uid);
  }
}
