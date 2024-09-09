import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { convert } from 'html-to-text';
import { DOMParser } from 'xmldom';

const EPUB_URL = "https://backend.bookracy.ru/download/b77662c34fed644e0ab7b4cf7317d2cb/Lost%20Signals.epub";

// Fetch the EPUB file as an ArrayBuffer
const fetchFile = async (url: string): Promise<{ buffer: ArrayBuffer; mimeType: string }> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
  const blob = await response.blob();
  const mimeType = blob.type;
  const arrayBuffer = await blob.arrayBuffer();
  return { buffer: arrayBuffer, mimeType };
};

interface EpubItem {
  id: string;
  href: string;
  mediaType: string;
}

// Process the EPUB file and extract the relevant HTML pages and resources
const handleEpub = async (buffer: ArrayBuffer): Promise<{ htmlPages: string[], resources: Map<string, ArrayBuffer>, coverImage?: string, styles: string[], tocIndex: number }> => {
  const zip = await JSZip.loadAsync(buffer);
  const contentOpf = await zip.file("content.opf")?.async("text");
  if (!contentOpf) throw new Error("content.opf not found");

  const parser = new DOMParser();
  const doc = parser.parseFromString(contentOpf, "application/xml");
  const items: EpubItem[] = Array.from(doc.getElementsByTagName("item")).map((item) => ({
    id: item.getAttribute("id") || "",
    href: item.getAttribute("href") || "",
    mediaType: item.getAttribute("media-type") || "",
  }));

  const coverImageId = Array.from(doc.getElementsByTagName("meta")).find(meta => meta.getAttribute("name") === "cover")?.getAttribute("content");
  const coverImageHref = coverImageId ? items.find(item => item.id === coverImageId)?.href : undefined;

  const htmlPages: string[] = [];
  const resources = new Map<string, ArrayBuffer>();
  const styles: string[] = [];
  let tocIndex = -1;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const content = await zip.file(item.href)?.async("arraybuffer");
    if (!content) continue;

    if (item.mediaType === "application/xhtml+xml") {
      const text = new TextDecoder().decode(content);
      htmlPages.push(text);

      // Identify Table of Contents page
      if (item.id.toLowerCase().includes("toc") || item.href.toLowerCase().includes("toc")) {
        tocIndex = htmlPages.length - 1;
      }
    } else if (item.mediaType.startsWith("image/")) {
      resources.set(item.href, content);
    } else if (item.mediaType === "text/css") {
      const cssContent = new TextDecoder().decode(content);
      styles.push(cssContent);
    }
  }

  return { htmlPages, resources, coverImage: coverImageHref, styles, tocIndex };
};

// Convert HTML to plain text while preserving some formatting
// Convert HTML to plain text while preserving some formatting
const htmlToText = (html: string): string => {
  let text = convert(html, {
    wordwrap: 130,
    preserveNewlines: true,
    selectors: [
      { selector: 'img', format: 'skip' },
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'b', format: 'inline' },
      { selector: 'strong', format: 'inline' },
      { selector: 'i', format: 'inline' },
      { selector: 'em', format: 'inline' },
      { selector: 'h1', format: 'block' },
      { selector: 'h2', format: 'block' },
      { selector: 'h3', format: 'block' },
      { selector: 'h4', format: 'block' },
      { selector: 'h5', format: 'block' },
      { selector: 'h6', format: 'block' },
      { selector: 'ul', format: 'block' },
      { selector: 'ol', format: 'block' },
      { selector: 'li', format: 'block' },
      { selector: 'blockquote', format: 'block' },
      { selector: 'pre', format: 'block' },
      { selector: 'code', format: 'inline' },
    ]
  });

  // Manually handle punctuation replacement after conversion
  text = text.replace(/(\w+)(\s*[\.\?\!\:\;]\s*\n)/g, "$1$2");
  return text;
};


// Build the PDF from the HTML pages
const buildPdf = async (): Promise<void> => {
  try {
    const { buffer, mimeType } = await fetchFile(EPUB_URL);

    if (mimeType !== "application/epub+zip") {
      throw new Error("Unsupported file type");
    }

    const { htmlPages, resources, coverImage, styles, tocIndex } = await handleEpub(buffer);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const lineHeightMultiplier = 1.6;  // Slightly larger for better readability
    const defaultFontSize = 14;  // Slightly larger for readability

    // Add cover image as the first page if it exists
    if (coverImage && resources.has(coverImage)) {
      const imgData = resources.get(coverImage)!;
      const dataUrl = `data:image/${coverImage.split('.').pop()};base64,${btoa(String.fromCharCode(...new Uint8Array(imgData)))}`;
      pdf.addImage(dataUrl, 'JPEG', margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
      pdf.addPage();
    }

    // Function to add content without splitting across pages
    const addContentWithoutSplitting = (contentCallback: () => void) => {
      const currentPage = pdf.internal.pages.length - 1;
      contentCallback();
      const newPage = pdf.internal.pages.length - 1;
      if (newPage > currentPage) {
        pdf.deletePage(newPage + 1); // Page index starts at 1 in jsPDF
        pdf.addPage();
        contentCallback();
      }
    };


    for (let i = 0; i < htmlPages.length; i++) {
      if (i > 0 || (i === 0 && coverImage)) pdf.addPage();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlPages[i], "text/html");
      const images = doc.getElementsByTagName('img');
      const paragraphs = doc.getElementsByTagName('p');

      // Inject styles into each page (if available)
      const styleTag = doc.createElement("style");
      styleTag.textContent = styles.join("\n");
      doc.getElementsByTagName("head")[0]?.appendChild(styleTag);

      let y = margin;

      // Handle images
      for (let j = 0; j < images.length; j++) {
        const img = images[j];
        let src = img.getAttribute('src');

        if (!src) continue;

        if (src.startsWith("../")) {
          src = src.replace("../", "");
        }

        if (resources.has(src)) {
          const imgData = resources.get(src)!;
          const dataUrl = `data:image/${src.split('.').pop()};base64,${btoa(String.fromCharCode(...new Uint8Array(imgData)))}`;

          // Maintain aspect ratio
          const imgProps = await pdf.getImageProperties(dataUrl);
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

          if (y + imgHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }

          pdf.addImage(dataUrl, 'JPEG', margin, y, imgWidth, imgHeight);
          y += imgHeight + 10;
        } else {
          console.warn(`Resource for image not found: ${src}`);
        }
      }

      // Handle paragraphs
      const processParagraphs = () => {
        for (let k = 0; k < paragraphs.length; k++) {
          const paragraph = paragraphs[k];
          const nodes = Array.from(paragraph.childNodes);

          for (let node of nodes) {
            let fontSize = defaultFontSize;
            let isBold = false;
            let isItalic = false;

            if (node.nodeName === 'B' || node.nodeName === 'STRONG') {
              isBold = true;
            } else if (node.nodeName === 'I' || node.nodeName === 'EM') {
              isItalic = true;
            } else if (/H[1-6]/.test(node.nodeName)) {
              fontSize = defaultFontSize + 4 * (7 - parseInt(node.nodeName[1]));
              isBold = true;
            }

            pdf.setFont("helvetica", isBold ? "bold" : isItalic ? "italic" : "normal");
            pdf.setFontSize(fontSize);

            let text = htmlToText(node.textContent || "").replace(/:\s*\n/g, ': ');

            // Trim excessive spaces and newlines
            text = text.replace(/\s+/g, ' ').trim();

            const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
            const lineHeight = lineHeightMultiplier * fontSize;

            for (const line of lines) {
              if (y + lineHeight > pageHeight - margin) {
                pdf.addPage();
                y = margin;
              }
              pdf.text(line, margin, y);
              y += lineHeight;
            }
          }

          y += 10;
        }
      };

      // Prevent splitting Table of Contents
      if (i === tocIndex && tocIndex !== -1) {
        addContentWithoutSplitting(processParagraphs);
      } else {
        processParagraphs();
      }
    }

    pdf.save("downloaded_epub.pdf");

    console.log("PDF generation complete and download initiated.");
  } catch (error: any) {
    console.error("Error building PDF:", error.message);
  }
};

document.getElementById("generate-pdf")?.addEventListener("click", buildPdf);