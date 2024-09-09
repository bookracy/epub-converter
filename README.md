# epub-converter
Convert EPUBs to PDFs - A Client-Side JavaScript Library

`epub-converter` is a simple JavaScript library designed to convert EPUB files into PDFs. It processes EPUB files on the client side using `jsPDF` and `JSZip`, allowing you to create PDF documents from your EPUBs directly in the browser.

## Features

- **Client-side EPUB to PDF conversion**: No need for server-side processing.
- **Handles images, text, and styles**: Extracts and processes HTML content, images, and CSS from the EPUB file.
- **Supports EPUB cover images**: Automatically adds the EPUB cover as the first page in the PDF if available.
- **Simple integration**: Easily integrate with your front-end projects.

## Installation

You can install `epub-converter` using npm:

```
npm install epub-converter
```

## Usage

Here's an example of how to use `epub-converter` in your project to convert an EPUB file to a PDF.

```
import { buildPdf } from 'epub-converter';

// Call the buildPdf function to convert the EPUB to a PDF
buildPdf();
```

### Example

To test the EPUB to PDF conversion with a specific EPUB URL:

```
const EPUB_URL = "https://backend.bookracy.ru/download/08eaf739cdb05b2553720c237139a3dd/Skeleton%20Key.epub";

(async () => {
  await buildPdf();
})();
```

The generated PDF will be automatically downloaded to the client.

## API

### `buildPdf(): Promise<void>`

Converts the EPUB specified in the `EPUB_URL` constant to a PDF and downloads it in the client.

#### Returns
- `Promise<void>`: Resolves when the conversion and download are complete.

## Project Structure

```
epub-to-pdf-converter/
├── src/
│   ├── fetchFile.ts
│   ├── handleEpub.ts
│   ├── htmlToText.ts
│   ├── buildPdf.ts
│   └── index.ts
├── package.json
├── README.md
├── .gitignore
└── tsconfig.json

```

## Running Tests

To run a simple test to verify that the conversion works without errors:

1. Create the `test/epubToPdfTest.js` file:

```
const { buildPdf } = require('../src/buildPdf'); 

(async () => {
  try {
    console.log("Starting EPUB to PDF conversion test...");
    await buildPdf();
    console.log("Test passed: PDF generated successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
})();
```

2. Add a `test` script in your `package.json`:

```
"scripts": {
  "test": "node test/epubToPdfTest.js"
}
```

3. Run the test:

```
npm run test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
