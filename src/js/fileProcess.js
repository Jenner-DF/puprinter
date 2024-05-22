import { PDFDocument, rgb, degrees } from "pdf-lib";
import { getPrinterConfig } from "./firebaseConfig";
PDFDocument;
import * as pdfjsLib from "pdfjs-dist/build/pdf";
// import * as pdfjsLib from "pdfjs-dist/legacy/bu ild/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

class DataProcessor {
  constructor(files, printer) {
    this.files = Array.from(files);
    this.file = null;
    this.printer = printer;
    this.finalprice = 0;
    this.finalpage = 0;
    this.margin = 5; // size in pixels
    this.selections = {
      paperSizes: {
        short: [612.0, 792.0],
        long: [612.0, 936.0],
        a4: [595.28, 841.89],
      }, //W x H
      presets: {
        //contrast,brightness,saturation
        original: [1, 0, 1],
        photo: [1.5, 25, 1.3],
        doc: [2.2, 10, 1.1],
        grayscale: [1, 0, 0],
      },
    };
    this.userSelection = {
      paperSize: this.selections.paperSizes.short,
      preset: this.selections.presets.original,
      copies: 1,
      orientation: "portrait",
    };
  }

  async checkFile() {
    const totalSize = this.files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > this.printer.uploadLimitBytes) {
      throw new Error(
        "Please ensure that the file size does not exceed 25 MB."
      );
    }
    //pdf file array
    this.pdfFiles = this.files.filter(
      (file) => file.type === "application/pdf"
    );
    //jpg/png file array
    this.imgFiles = this.files.filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type)
    );

    await this.mergePDFbytes();
    // await this.mergeIMGtoPDFbytes();
    await this.loadPDF();
    // //check if PDF upload
    // if (this.file.type === "application/pdf") {
    //   return await this.loadPDF(this.file, this.printer);
    // } else if (
    //   //cheeck if IMG upload
    //   this.file.type === "image/jpeg" ||
    //   this.file.type === "image/png"
    // ) {
    //   this.loadIMG();
    // } else {
    //   throw new Error("Please upload a PDF/JPG/PNG file only.");
    // }
  }
  async mergePDFbytes() {
    this.getUserSelection();
    //get all files as arraybuffers
    const pdfArrayBuffers = await Promise.all(
      this.pdfFiles.map((file) => file.arrayBuffer())
    );
    // Create a new PDFDocument
    const mergedPdf = await PDFDocument.create();
    //get user dimensions
    const [selectedWidth, selectedHeight] = this.userSelection.paperSize;

    // Loop through each PDF ArrayBuffer
    for (const pdfBytes of pdfArrayBuffers) {
      // Load the PDFDocument from the ArrayBuffer
      const pdfDoc = await PDFDocument.load(pdfBytes);
      // Get all the pages of the PDFDocument
      const pages = pdfDoc.getPages();
      //adding new modifiedpdfpage because of bug in blank paper
      //adding invisible '' because it cannot be empty
      for (const page of pages) {
        page.drawText("", {
          x: 50, // X coordinate for the text
          y: page.getHeight() - 50, // Y coordinate for the text
          size: 12, // Font size
          color: rgb(1, 1, 1), // white color, invisible
        });
      }
      // Save the modified PDFDocument to bytes
      const modifiedPdfBytes = await pdfDoc.save();
      // Load the modified PDFDocument again
      const modifiedPdfDoc = await PDFDocument.load(modifiedPdfBytes);
      const modifiedPages = modifiedPdfDoc.getPages();
      // Add each page to the merged PDFDocument
      for (let i = 0; i < modifiedPages.length; i++) {
        console.log(i);
        const page = pages[i];

        // Add a new page with the specified dimensions
        const newPage = mergedPdf.addPage([
          selectedWidth + this.margin * 2,
          selectedHeight + this.margin * 2,
        ]);

        // Calculate the scaling factor to fit the content into the new page
        const scale = Math.min(
          (selectedWidth - this.margin * 2) / page.getWidth(),
          (selectedHeight - this.margin * 2) / page.getHeight()
        );

        // Get the dimensions of the page scaled to fit the new page
        const scaledWidth = page.getWidth() * scale;
        const scaledHeight = page.getHeight() * scale;

        // Embed the current page in the new page
        const [embeddedPage] = await mergedPdf.embedPdf(modifiedPdfBytes, [i]);

        //embeds existing pdf page into the new page
        newPage.drawPage(embeddedPage, {
          x: this.margin + (selectedWidth - scaledWidth) / 2,
          y: this.margin + (selectedHeight - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
        // Draw the embedded page on the new page
      }
    }
    // Save the merged PDFDocument to an ArrayBuffer
    const mergedPdfBytes = await mergedPdf.save();
    this.file = mergedPdfBytes;
  }
  async mergeIMGtoPDFbytes() {
    this.getUserSelection();
    const imgArrayBuffers = await Promise.all(
      this.imgFiles.map((file) => file.arrayBuffer())
    );
    // Create a new PDFDocument
    const mergedImg = await PDFDocument.create();
    //get user dimensions
    const [selectedWidth, selectedHeight] = this.userSelection.paperSize;

    // Loop through each image ArrayBuffer
    for (const imageBytes of imgArrayBuffers) {
      // Embed image into PDF
      const image = await mergedImg.embedPng(imageBytes); // Change to embedJpg for JPEG images

      // Add a new page with specified dimensions including margins
      const page = mergedImg.addPage([
        selectedWidth + this.margin * 2,
        selectedHeight + this.margin * 2,
      ]);

      // Calculate the scaling factor to fit the content into the new page
      const scale = Math.min(
        (selectedWidth - this.margin * 2) / image.width,
        (selectedHeight - this.margin * 2) / image.height
      );

      // Get the dimensions of the page scaled to fit the new page
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      // Draw the image on the page, centered within the margins
      page.drawImage(image, {
        x: this.margin + (selectedWidth - scaledWidth) / 2,
        y: selectedHeight - scaledHeight - this.margin,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    // Save the PDF document to an ArrayBuffer
    const mergedImgBytes = await mergedImg.save();
    this.file = mergedImgBytes;
  }
  async imgToPDF() {}
  async downloadPDF() {
    await this.mergePDFbytes();
    // await this.mergeIMGtoPDFbytes();
    const pdfbytes = this.file;
    const pdfBlob = new Blob([pdfbytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement("a");
    link.href = pdfUrl;
    console.log(link.href);
    link.download = "lossless.pdf";
    link.click();
    URL.revokeObjectURL(pdfUrl); // Clean up URL object
    //lossless
    // console.log(`my DATA`);
    // console.log(mergedFileBytes);
    // console.log(this.pdf);
  }
  //SAME JUST LOAD A SINGLE PDF FILE TO BE SAME CODE
  async loadPDF() {
    //make pdf into bytes
    this.pdfBytes = this.file;
    const loadingTask = pdfjsLib.getDocument(this.pdfBytes);
    this.pdf = await loadingTask.promise;
    // Loading a PDF document
    this.finalpage = this.pdf.numPages;
    console.log(`PDF loaded with ${this.pdf.numPages} pages.`);

    if (this.finalpage > this.printer.pageLimit)
      throw new Error(
        `Please upload files with ${this.printer.pageLimit} pages or less only`
      );

    //get user selection from ui
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
  async loadIMG() {
    //make the image pdf first then can use loadPDF()
    console.log(`this is my IMAGE!`);
  }

  getUserSelection() {
    const selectedPaper = document.getElementById("select-paper").value;
    const selectedColored = document.getElementById("select-colored").value;
    const selectedOrientation =
      document.getElementById("select-orientation").value;
    const selectedCopies = document.getElementById("select-copies").value;
    //copies
    this.userSelection.copies = selectedCopies;
    //orientation (just rotate the image, not the paper)
    this.userSelection.orientation = selectedOrientation;
    //paper options

    if (selectedOrientation === "landscape") {
      if (selectedPaper === "short")
        this.userSelection.paperSize = this.reverseDimensions(
          this.selections.paperSizes.short
        );
      if (selectedPaper === "long")
        this.userSelection.paperSize = this.reverseDimensions(
          this.selections.paperSizes.long
        );
      if (selectedPaper === "a4")
        this.userSelection.paperSize = this.reverseDimensions(
          this.selections.paperSizes.a4
        );
    } else {
      if (selectedPaper === "short")
        this.userSelection.paperSize = this.selections.paperSizes.short;
      if (selectedPaper === "long")
        this.userSelection.paperSize = this.selections.paperSizes.long;
      if (selectedPaper === "a4")
        this.userSelection.paperSize = this.selections.paperSizes.a4;
    }

    //color options
    if (selectedColored === "original")
      this.userSelection.preset = this.selections.presets.original;
    if (selectedColored === "photo")
      this.userSelection.preset = this.selections.presets.photo;
    if (selectedColored === "docs")
      this.userSelection.preset = this.selections.presets.doc;
    if (selectedColored === "grayscale")
      this.userSelection.preset = this.selections.presets.grayscale;
  }
  reverseDimensions(dimensions) {
    return [dimensions[1], dimensions[0]];
  }
  async renderPage(page, pageNum) {
    const [selectedWidth, selectedHeight] = this.userSelection.paperSize;
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement("canvas");
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    // Adjust the canvas width and height to include the this.margins
    canvas.width = selectedWidth + this.margin * 2;
    canvas.height = selectedHeight + this.margin * 2;
    document.querySelector(".canvas_container").appendChild(canvas);
    // Calculate the scale to fit the PDF page into Letter size
    const scaleX = (selectedWidth - this.margin * 2) / viewport.width;
    const scaleY = (selectedHeight - this.margin * 2) / viewport.height;
    const scale = Math.min(scaleX, scaleY); // Use the smaller scale to maintain aspect ratio

    // Get the scaled viewport
    const scaledViewport = page.getViewport({ scale: scale });
    // Calculate the offset to center the content within the margins
    const offsetX = (canvas.width - scaledViewport.width) / 2;
    const offsetY = (canvas.height - scaledViewport.height) / 2;
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
  async generateFinalFile() {
    //FOR SUBMISSION
    const renderedCanvases = document.querySelectorAll(
      ".canvas_container canvas"
    );
    const pdfDoc = await this.createPDFFromCanvases(renderedCanvases);
    const pdfBytes = await pdfDoc.save({ addDefaultPage: false }); //this returns u8int that need for firebase url no need to convert to blob(just to download manually for now)
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = pdfUrl;
    console.log(link.href);
    link.download = "generated.pdf";
    link.click();
  }
  async createPDFFromCanvases(renderedCanvases) {
    const pdfDoc = await PDFDocument.create();

    for (const canvas of renderedCanvases) {
      const imgData = canvas.toDataURL();
      const imgBytes = Uint8Array.from(atob(imgData.split(",")[1]), (c) =>
        c.charCodeAt(0)
      );
      const pngImage = await pdfDoc.embedPng(imgBytes);
      const pngDims = pngImage.scale(1);

      // Add a blank page to the document
      const page = pdfDoc.addPage();

      // Assuming `this.userSelection.paperSize` contains the dimensions in points
      const [selectedWidth, selectedHeight] = this.userSelection.paperSize;
      page.setSize(selectedWidth, selectedHeight);

      // Draw the PNG image in the center on x-axis and at the top on y-axis
      page.drawImage(pngImage, {
        x: page.getWidth() / 2 - pngDims.width / 2,
        y: 0,
        width: pngDims.width,
        height: pngDims.height,
      });
    }
    return pdfDoc;
  }
}

export { DataProcessor };
