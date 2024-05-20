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
    this.newPdfBytes = null;
    this.selections = {
      paperSize: {
        short: [612.0, 792.0],
        long: [612.0, 936.0],
        a4: [595.28, 841.89],
      }, //W x H
      presets: {
        //contrast,brightness,saturation
        original: [1, 0, 1],
        photo: [1.6, 25, 1.2],
        doc: [1.8, 30, 1.1],
        grayscale: [1, 0, 0],
      },
    };
    this.userSelection = {
      paperSize: this.selections.paperSize.short,
      preset: this.selections.presets.original,
    };
  }

  async colorDoc() {}
  async checkFile() {
    if (this.file.size > this.printer.uploadLimitBytes) {
      throw new Error(
        "Please ensure that the file size does not exceed 25 MB."
      );
    }
    //check if PDF upload
    if (this.file.type === "application/pdf") {
      return await this.loadPDF(this.file, this.printer);
    } else if (
      //cheeck if IMG upload
      this.file.type === "image/jpeg" ||
      this.file.type === "image/png"
    ) {
      this.loadIMG();
    } else {
      throw new Error("Please upload a PDF/JPG/PNG file only.");
    }
  }
  async loadIMG() {
    //make the image pdf first then can use loadPDF()
    console.log(`this is my IMAGE!`);
  }
  async loadPDF() {
    //make pdf into bytes
    this.pdfBytes = await this.file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(this.pdfBytes);
    this.pdf = await loadingTask.promise;
    // Loading a PDF document
    this.finalpage = this.pdf.numPages;
    console.log(`PDF loaded with ${this.pdf.numPages} pages.`);
    if (this.finalpage > this.printer.pageLimit)
      throw new Error(
        `Please upload files with ${this.printer.pageLimit} pages or less only`
      );
    //rendering each page
    //get values for paper size,color
    this.getUserSelection();

    console.log(`my user options: ${this.userSelection}`);
    //rendering each page
    for (let pageNum = 1; pageNum <= this.finalpage; pageNum++) {
      const page = await this.pdf.getPage(pageNum);
      //add args for papersize and coloroption
      const canvas = await this.renderPage(page, pageNum);
      this.adjustContrast(canvas);
    }
  }
  getUserSelection() {
    const selectPaper = document.getElementById("select-paper").value;
    const selectColored = document.getElementById("select-colored").value;
    //paper options
    if (selectPaper === "short")
      this.userSelection.paperSize = this.selections.paperSize.short;
    if (selectPaper === "long")
      this.userSelection.paperSize = this.selections.paperSize.long;
    if (selectPaper === "a4")
      this.userSelection.paperSize = this.selections.paperSize.a4;
    //color options
    if (selectColored === "original")
      this.userSelection.preset = this.selections.presets.original;
    if (selectColored === "photo")
      this.userSelection.preset = this.selections.presets.photo;
    if (selectColored === "docs")
      this.userSelection.preset = this.selections.presets.doc;
    if (selectColored === "grayscale")
      this.userSelection.preset = this.selections.presets.grayscale;
  }
  async renderPage(page, pageNum) {
    const [selectedWidth, selectedHeight] = this.userSelection.paperSize;
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement("canvas");
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = selectedWidth;
    canvas.height = selectedHeight;
    document.querySelector(".canvas_container").appendChild(canvas);
    // Calculate the scale to fit the PDF page into Letter size
    const scaleX = selectedWidth / viewport.width;
    const scaleY = selectedHeight / viewport.height;
    const scale = Math.min(scaleX, scaleY); // Use the smaller scale to maintain aspect ratio
    // Get the scaled viewport
    const scaledViewport = page.getViewport({ scale: scale });
    // Calculate the offset to center the content only on x axis
    const offsetX = (selectedWidth - scaledViewport.width) / 2;
    const offsetY = 0;
    // Temporary canvas to render the scaled content
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    tempCanvas.width = scaledViewport.width;
    tempCanvas.height = scaledViewport.height;
    const renderContext = {
      canvasContext: tempCtx,
      viewport: scaledViewport,
    };
    // Render the page onto the temporary canvas
    await page.render(renderContext).promise;
    // Draw the scaled content onto the main canvas at the calculated offsets
    this.ctx.drawImage(tempCanvas, offsetX, offsetY);
    //get data to be passed to color changer
    // const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    // this.ctx.putImageData(imageData, 0, 0);

    document
      .querySelector(".canvas_container")
      .insertAdjacentHTML("beforeend", `<div> page ${pageNum}`);
    return canvas;
  }
  async createPDFFromCanvases(renderedCanvases) {
    const pdfDoc = await PDFDocument.create();

    renderedCanvases.forEach(async (canvas, index) => {
      const imgData = canvas.toDataURL();
      const imgBytes = Uint8Array.from(atob(imgData.split(",")[1]), (c) =>
        c.charCodeAt(0)
      );
      console.log("tangina may sobra!");
      console.log(index);
      const pngImage = await pdfDoc.embedPng(imgBytes);
      const pngDims = pngImage.scale(1);
      // Add a blank page to the document
      const page = pdfDoc.addPage();
      page.setSize(612, 1008);
      const mediaBox = page.getMediaBox();
      //612,1008 - long
      //576, 792 - short
      page.setMediaBox(mediaBox.x, mediaBox.y, 612, 1008);
      // Draw the JPG image in the center on x axis of the page
      page.drawImage(pngImage, {
        x: page.getWidth() / 2 - pngDims.width / 2,
        y: 0,
        width: pngDims.width,
        height: pngDims.height,
      });
    });

    return pdfDoc;
  }
  async analyzeColors(canvas, colorPercentageLow, colorPercentageHigh) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
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
  // async colorPhoto() {
  //   //need to store to array all the original pageImageData
  //   for (let pageNum = 1; pageNum <= this.finalpage; pageNum++) {
  //     const page = await this.pdf.getPage(pageNum);
  //     const canvas = await this.renderPage(page, pageNum);
  //     this.adjustContrast(canvas);
  //   }

  //   // //FOR SUBMISSION
  //   // const renderedCanvases = document.querySelectorAll(
  //   //   ".canvas_container canvas"
  //   // );
  //   // const pdfDoc = await this.createPDFFromCanvases(renderedCanvases);
  //   // const pdfBytes = await pdfDoc.save({ addDefaultPage: false }); //this returns u8int that need for firebase url no need to convert to blob(just to download manually for now)
  //   // const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  //   // const pdfUrl = URL.createObjectURL(pdfBlob);
  //   // const link = document.createElement("a");
  //   // link.href = pdfUrl;
  //   // console.log(link.href);
  //   // link.download = "generated.pdf";
  //   // link.click();
  // }
  adjustContrast(canvas) {
    const [contrast, brightness, saturation] = this.userSelection.preset;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    if (contrast !== 0) {
      for (let i = 0; i < data.length; i += 4) {
        // Adjust contrast
        data[i] = (data[i] - 128) * contrast + 128;
        data[i + 1] = (data[i + 1] - 128) * contrast + 128;
        data[i + 2] = (data[i + 2] - 128) * contrast + 128;

        // Adjust brightness
        data[i] += brightness;
        data[i + 1] += brightness;
        data[i + 2] += brightness;

        // Convert RGB to HSL for saturation adjustment
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h,
          s,
          l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          let d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
          h /= 6;
        }

        // Adjust saturation
        s *= saturation;

        // Convert HSL back to RGB
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        data[i] = this.hueToRGB(p, q, h + 1 / 3) * 255;
        data[i + 1] = this.hueToRGB(p, q, h) * 255;
        data[i + 2] = this.hueToRGB(p, q, h - 1 / 3) * 255;
      }
    }
    // No need to store `data`, directly modify `imageData.data` (it will error)
    this.ctx.putImageData(imageData, 0, 0);
  }
  hueToRGB(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  async generatePriceAmount(paperType, colorOption) {
    //get PDF data
    this.finalprice = 0;
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
