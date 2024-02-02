import { PDFDocument } from "pdf-lib";
//prettier-ignore
import { storage,addDoc,doc,getDoc,getDocs,serverTimestamp, ref,collection, db, auth, getDownloadURL,uploadBytes, getUserProfile,runTransaction } from "./firebaseConfig";
import { updateDoc } from "firebase/firestore";
//NOTE: JUSTCORS IS IN URL WHEN DEPLOYING LIVE!
//NOTE:Cannot bypass CORS, need to use gsutil and create CORS config file

export default class PrintForm {
  constructor(file, colorOption, paperType) {
    this.userID = auth.currentUser.uid;
    this.colorOption = colorOption;
    this.file = file;
    this.paperType = paperType;
    console.log(this.userID, this.colorOption, this.file, this.paperType);
  }
  static async createInstance(file, colorOption, paperType) {
    const instance = new PrintForm(file, colorOption, paperType);
    await instance._exportPrintFormToDB();
    return instance.pincode;
  }
  async _exportPrintFormToDB() {
    try {
      this._userData = await getUserProfile(auth.currentUser.uid);
      (this.pincode = await this._generateFilePinCode()),
        (this.fileurl = await this._generateFileUrl());
      this.price = await PrintForm._generatePriceAmount(
        this.fileurl,
        this.paperType,
        this.colorOption
      );
      await runTransaction(db, async (transaction) => {
        transaction.set(this._docRef, {
          userID: auth.currentUser.uid,
          filename: this.file.name,
          fileURL: this.fileurl,
          paperType: this.paperType,
          price: this.price,
          colorOption: this.colorOption,
          status: "Ready for Printing",
          timestamp: serverTimestamp(),
        });
      });
      await this.updateUserWallet();

      // await addDoc(this._docRef, {
      //   userID: auth.currentUser.uid,
      //   filename: this.file.name,
      //   fileURL: this.fileurl,
      //   paperType: this.paperType,
      //   userSecretPinCode: this._userData.secretpin,
      //   price: this.price,
      //   colorOption: this.colorOption,
      //   filePinCode: this.pincode,
      //   status: "Ready for Printing",
      //   timestamp: serverTimestamp(),
      // });
    } catch (e) {
      alert(e);
    }
  }
  async updateUserWallet() {
    const newWalletBal = this._userData.wallet - this.price;
    await updateDoc(doc(db, "users", this._userData.uid), {
      wallet: newWalletBal,
    });
  }
  async _generateFileUrl() {
    const storageRef = ref(storage, this.pincode); //path
    const fileRef = ref(storageRef, this.file.name);
    // 'file' comes from the Blob(no filename) or File API
    try {
      const snapshot = await uploadBytes(fileRef, this.file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (e) {
      alert(e);
    }
  }
  async _generateFilePinCode() {
    let attempt = 0;
    let success = false;
    while (!success && attempt < 10) {
      attempt++; // Limit attempts to prevent infinite loops
      const newPIN = Math.floor(1000 + Math.random() * 9000).toString(); // Generate PIN only 1000-9999 (9000pins)
      let pincode;
      try {
        pincode = await runTransaction(db, async (transaction) => {
          const docRef = doc(db, "printForms", newPIN);
          const newdoc = await transaction.get(docRef);
          if (!newdoc.exists()) {
            this._docRef = docRef; // The PIN is unique, proceed to use it
            success = true;
            return String(newPIN);
          }
        });
      } catch (e) {
        throw e;
      }
      if (success) return pincode;
    }
    if (!success) {
      throw new Error("Failed to assign a unique PIN after several attempts.");
    }
  }
  static async _generatePriceAmount(file, paper, color, local = false) {
    // short = ₱2 || long = ₱3 &&
    // colorOption = +₱3 || grayscale = +₱0
    const paperType = paper === "short" ? 2 : 3;
    const colorOption = color === "colored" ? 3 : 0;
    this.pricemultiplier = paperType + colorOption;
    let url;
    let existingPdfBytes;
    if (!local) {
      //NOTE:Cannot bypass CORS, need to use gsutil and create CORS config file
      url = `https://justcors.com/tl_9bff6ec/${file}`;
      existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    } else {
      existingPdfBytes = await file.arrayBuffer();
    }
    //get PDF data
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const totalpage = pdfDoc.getPageCount();
    //get pdf price
    return totalpage * this.pricemultiplier;
  }
}
