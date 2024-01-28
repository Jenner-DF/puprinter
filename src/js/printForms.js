import { PDFDocument } from "pdf-lib";
//prettier-ignore
import { storage,addDoc,doc,getDoc,getDocs,serverTimestamp, ref,collection, db, auth, getDownloadURL,uploadBytes, getUserProfile } from "./firebaseConfig";
//NOTE: JUSTCORS IS IN URL WHEN DEPLOYING LIVE!
//NOTE:Cannot bypass CORS, need to use gsutil and create CORS config file

export default class PrintForm {
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
    return instance.pincode;
  }
  async _exportPrintFormToDB() {
    try {
      console.log(`LOGGENING PUKINGNANG MINO!!!!`);
      this._userData = await getUserProfile(auth.currentUser.uid);
      console.log(this._userData);
      this.fileurl = await this._generateFileUrl();
      console.log(this.fileurl);
      this.pincode = await this._generateFilePinCode();
      console.log(this.pincode);
      this.price = await PrintForm._generatePriceAmount(
        this.fileurl,
        this.paperSize,
        this.paperColor
      );
      await addDoc(this._colRef, {
        userID: auth.currentUser.uid,
        filename: this.file.name,
        fileURL: this.fileurl,
        paperSize: this.paperSize,
        userSecretPinCode: this._userData.secretpin,
        price: this.price,
        colored: this.paperColor,
        filePinCode: this.pincode,
        timestamp: serverTimestamp(),
      });
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
    console.log(snapshot);
    const pincode = String(snapshot.size + 1).padStart(4, "0");
    return pincode;
  }
  static async _generatePriceAmount(file, paper, color, local = false) {
    // short = ₱2 || long = ₱3 &&
    // colored = +₱3 || grayscale = +₱0
    const papersize = paper === "short" ? 2 : 3;
    const colored = color === "colored" ? 3 : 0;
    this.pricemultiplier = papersize + colored;
    let url;
    let existingPdfBytes;
    if (!local) {
      //NOTE:Cannot bypass CORS, need to use gsutil and create CORS config file
      url = `https://justcors.com/tl_6dceeee/${file}`;
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
