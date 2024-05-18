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
    this.originalImageData = null;
  }

  async colorDoc() {}
  async checkFile() {
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
  async loadIMG() {
    console.log(`this is my IMAGE!`);
  }
  async loadPDF() {
    //make pdf into bytes
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
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    document.querySelector(".canvas_container").appendChild(canvas);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    this.originalImageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    return canvas;
  }
  async analyzeColors(canvas, colorPercentageLow, colorPercentageHigh) {
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.imageData = data.data;
    let coloredPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = this.imageData[i];
      const g = this.imageData[i + 1];
      const b = this.imageData[i + 2];
      // Check if the pixel is not grayscale
      if (!(r === g && g === b)) {
        coloredPixels++;
      }
    }
    const totalPixels = this.imageData.length / 4;
    const colorPercentage = (coloredPixels / totalPixels) * 100;
    console.log(`Color percentage: ${colorPercentage.toFixed(2)}%`);
    return colorPercentage < 60 ? colorPercentageLow : colorPercentageHigh;
  }
  async colorPhoto() {
    const contrast = Number(document.querySelector("#contrast").value);
    const brightness = Number(document.querySelector("#brightness").value);
    const saturation = Number(document.querySelector("#saturation").value);
    for (let pageNum = 1; pageNum <= this.finalpage; pageNum++) {
      const page = await this.pdf.getPage(pageNum);
      const canvas = await this.renderPage(page);

      this.adjustContrast(canvas, contrast, brightness, saturation);
    }
  }
  adjustContrast(canvas, contrast, brightness, saturation) {
    const ctx = canvas.getContext("2d");
    ctx.putImageData(this.originalImageData, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // You can implement your own contrast adjustment algorithm here.
    // For simplicity, let's just increase the contrast of each pixel.
    let data = imageData.data;
    if (contrast !== 0) {
      // console.log(`my contrast value: ${contrast}`);
      // console.log(`${contrast !== 0}`);
      // console.log(`${typeof contrast}`);
      // console.log("ORIG PHOTO!");
      for (let i = 0; i < data.length; i += 4) {
        //CONTRAST OLD
        // data[i] *= 10.5; // Increase the red channel
        // data[i + 1] *= 1.5; // Increase the green channel
        // data[i + 2] *= 1.5; // Increase the blue channel

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

    // No need to store `data`, directly modify `imageData.data`
    ctx.putImageData(imageData, 0, 0);
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
