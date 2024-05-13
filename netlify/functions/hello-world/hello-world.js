// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const Busboy = require("busboy");
const { PDFDocument } = require("pdf-lib");

const handler = async (event) => {
  let pageCount = 0;
  try {
    // const data = JSON.parse(event.body);
    // const file = data.file;
    // const colorOption = data.colorOption;
    // const paperType = data.paperType;
    // const paymentOption = data.paymentOption;

    // const subject = event.queryStringParameters.name || "World";

    const busboy = Busboy({ headers: event.headers });

    busboy.on("file", async (file, filename, encoding, mimetype) => {
      if (mimetype === "application/pdf") {
        console.log(`file infos:`);
        console.log(filename, encoding, mimetype);
        let buffers = [];
        file
          .on("data", (data) => {
            buffers.push(data);
          })
          .on("end", async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            pageCount = pdfDoc.getPageCount();
            console.log(`The PDF has ${pageCount} pages.`);
            // You can now pass this pageCount back in your response or handle it as needed
          });
      }
    });
    // Collect all parts of the incoming request and end the response once complete
    busboy.on("finish", () => {
      console.log("Upload complete, sending response.");
      resolve({
        statusCode: 200,
        body: JSON.stringify({
          message: `wow amazing! PDF has ${pageCount} pages.`,
        }),
      });
    });
    busboy.on("error", (error) => {
      console.error("Busboy error:", error);
      reject({ statusCode: 500, body: error.toString() });
    });

    // Busboy needs to consume the event body
    busboy.write(Buffer.from(event.body, "base64"));
    busboy.end();
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
