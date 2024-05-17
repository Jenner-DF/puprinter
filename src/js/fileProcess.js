import { PDFDocument } from "pdf-lib";
import { getPrinterConfig } from "./firebaseConfig";
PDFDocument;
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

class DataProcessor {
  constructor(file, printer) {
    this.file = file;
    this.printer = printer;
    this.pdf = null;
    this.finalprice = 0;
    this.finalpage = 0;
  }

  static async loadbytes(file) {
    const pdfBytes = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(pdfBytes);
    const pdf = await loadingTask.promise;
    console.log(pdfBytes);
    console.log(pdf);
    console.log(`ikopsdjfgiosdjg`);
  }
  async checkFile() {
    console.log(this.printer);
    // console.log(this.pdfBytes);
    if (this.file.size > this.printer.uploadLimitBytes) {
      throw new Error(
        "Please ensure that the file size does not exceed 25 MB."
      );
    }
    if (this.file.type === "application/pdf") {
      return await this.loadPDF(this.file, this.printer);
    } else if (
      this.file.type === "image/jpeg" ||
      this.file.type === "image/png"
    ) {
      this.loadIMG();
    } else {
      throw new Error("Please upload a PDF/JPG/PNG file only.");
    }
  }
  // checkPDF(file) {}

  // checkImage(file) {}
  async loadIMG() {
    console.log(`this is my IMAGE!`);
  }
  async loadPDF() {
    this.pdfBytes = await this.file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(this.pdfBytes);
    this.pdf = await loadingTask.promise;
    // Loading a PDF document
    console.log(`PDF loaded with ${this.pdf.numPages} pages.`);
    this.finalpage = this.pdf.numPages;
    // this.pdf = pdf;
    if (this.finalpage > this.printer.pageLimit)
      throw new Error(
        `Please upload files with ${this.printer.pageLimit} pages or less only`
      );
    for (let pageNum = 1; pageNum <= this.finalpage; pageNum++) {
      const page = await this.pdf.getPage(pageNum);
      await this.renderPage(page);
    }
  }
  async renderPage(page) {
    const scale = 1.0; // Adjust scale for your needs
    const viewport = page.getViewport({ scale: scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    document.querySelector(".canvas_container").appendChild(canvas);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    return canvas;
  }
  async analyzeColors(canvas, colorPercentageLow, colorPercentageHigh) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let coloredPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Check if the pixel is not grayscale
      if (!(r === g && g === b)) {
        coloredPixels++;
      }
    }
    const totalPixels = data.length / 4;
    const colorPercentage = (coloredPixels / totalPixels) * 100;
    console.log(`Color percentage: ${colorPercentage.toFixed(2)}%`);
    return colorPercentage < 60 ? colorPercentageLow : colorPercentageHigh;
  }
  async generatePriceAmount(paperType, colorOption) {
    //get PDF data
    let priceMultiplier;
    if (paperType === "short") priceMultiplier = this.printer.priceShort;
    if (paperType === "long") priceMultiplier = this.printer.priceLong;
    if (paperType === "a4") priceMultiplier = this.printer.priceA4;
    if (colorOption === "grayscale")
      this.finalprice = priceMultiplier * this.finalpage;
    else {
      for (let pageNum = 1; pageNum <= this.finalpage; pageNum++) {
        const page = await this.pdf.getPage(pageNum);
        const canvas = await this.renderPage(page);
        const priceColoredByPercent = await this.analyzeColors(
          canvas,
          this.printer.colorPercentageLow,
          this.printer.colorPercentageHigh
        );
        this.finalprice += priceMultiplier + priceColoredByPercent;
        console.log(`new fp: ${this.finalprice}`);
      }
    }
    console.log(`document final price is: ${this.finalprice}`);
  }
}

export { DataProcessor };
