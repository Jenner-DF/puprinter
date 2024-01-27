import { PDFDocument } from "pdf-lib";
//prettier-ignore
import { storage,addDoc,doc,getDoc,getDocs,getUserData,serverTimestamp, ref,collection, db, auth, getDownloadURL,uploadBytes } from "./firebaseConfig";

export default class PrintForm {
  _userData;
  _colRef = collection(db, "printForms");
  constructor(file, paperColor, paperSize) {
    this.userID = auth.currentUser.uid;
    this.paperColor = paperColor;
    this.file = file;
    this.paperSize = paperSize;
    console.log(this.userID, this.paperColor, this.file, this.paperSize);
  }
  static async createInstance(file, colored, paperSize) {
    const instance = new PrintForm(file, colored, paperSize);
    await instance._exportPrintFormToDB();
    return instance;
  }
  async _exportPrintFormToDB() {
    try {
      this._userData = await getUserData(this.userID);
      this.fileurl = await this._generateFileUrl();
      this.pincode = await this._generateFilePinCode();
      this.price = await this._generatePriceAmount();
      await addDoc(this._colRef, {
        userID: auth.currentUser.uid,
        filename: this.file.name,
        fileURL: this.fileurl,
        paperSize: this.paperSize,
        userSecretPinCode: this._userData.secretpin, //BUG: NO GET USER DATA YET
        price: this.price, //default to 3 BUG:NO FUNCTION FOR PRICE PER PAGE YET
        colored: this.paperColor,
        filePinCode: this.pincode,
        timestamp: serverTimestamp(),
      });
      alert(`UPLOADED FILE TO DB!`);
    } catch (e) {
      alert(e);
    }
  }
  async _generateFileUrl() {
    const storageRef = ref(storage, String(this.userID)); //path
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
    const snapshot = await getDocs(collection(db, "printForms"));
    const pincode = String(snapshot.size + 1).padStart(4, "0");
    return pincode;
  }
  async _generatePriceAmount() {
    // short = ₱2, long = ₱3 || colored = +₱3, grayscale = +₱0
    const papersize = this.paperSize === "short" ? 2 : 3;
    const colored = this.paperColor === "colored" ? 3 : 0;
    this.pricemultiplier = papersize + colored;
    //needs to bypass CORS because of local server
    const url = `https://justcors.com/tl_7de7b57/${this.fileurl}`;
    //get PDF data
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const totalpage = pdfDoc.getPageCount();
    //get pdf price
    return totalpage * this.pricemultiplier;
  }
}
