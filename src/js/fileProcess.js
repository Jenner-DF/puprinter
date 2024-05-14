import { PDFDocument } from "pdf-lib";
import { getPrinterConfig } from "./firebaseConfig";
PDFDocument;
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

class DataProcessor {
  static async loadPDF(file) {
    // Loading a PDF document
    const pdfBytes = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(pdfBytes);
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded with ${pdf.numPages} pages.`);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      await DataProcessor.renderPage(page);
    }
  }
  static async renderPage(page) {
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
  static async analyzeColors(canvas, colorPercentageLow, colorPercentageHigh) {
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
  static async generatePriceAmount(file, paperType, colorOption) {
    const printer = await getPrinterConfig("printer1");
    //get PDF data
    const pdfBytes = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(pdfBytes);
    const pdf = await loadingTask.promise;
    let priceMultiplier;
    let finalprice = 0;

    if (paperType === "short") priceMultiplier = printer.priceShort;
    if (paperType === "long") priceMultiplier = printer.priceLong;
    if (paperType === "a4") priceMultiplier = printer.priceA4;
    if (colorOption === "grayscale")
      finalprice = priceMultiplier * pdf.numPages;
    else {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const canvas = await DataProcessor.renderPage(page);
        const priceColoredByPercent = await DataProcessor.analyzeColors(
          canvas,
          printer.colorPercentageLow,
          printer.colorPercentageHigh
        );
        console.log(`current fp: ${finalprice}`);
        finalprice += priceMultiplier + priceColoredByPercent;
        console.log(`new fp: ${finalprice}`);
      }
    }
    console.log(`document final price is: ${finalprice}`);
    const finalpage = pdf.numPages;
    return [finalprice, finalpage];
  }
}

export { DataProcessor };
