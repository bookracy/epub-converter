import { jsPDF } from "jspdf";
import { fetchFile } from './fetchFile';
import { handleEpub } from './handleEpub';
import { htmlToText } from './htmlToText';

export const buildPdf = async (epubUrl: string): Promise<void> => {
  try {
    const { buffer, mimeType } = await fetchFile(epubUrl);

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
    const lineHeightMultiplier = 1.6;
    const defaultFontSize = 14;

    if (coverImage && resources.has(coverImage)) {
      const imgData = resources.get(coverImage)!;
      const dataUrl = `data:image/${coverImage.split('.').pop()};base64,${btoa(String.fromCharCode(...new Uint8Array(imgData)))}`;
      pdf.addImage(dataUrl, 'JPEG', margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
      pdf.addPage();
    }

    for (let i = 0; i < htmlPages.length; i++) {
      if (i > 0 || (i === 0 && coverImage)) pdf.addPage();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlPages[i], "text/html");
      const images = doc.getElementsByTagName('img');
      const paragraphs = doc.getElementsByTagName('p');

      let y = margin;

      for (let j = 0; j < images.length; j++) {
        const img = images[j];
        let src = img.getAttribute('src');

        if (!src) continue;

        if (resources.has(src)) {
          const imgData = resources.get(src)!;
          const dataUrl = `data:image/${src.split('.').pop()};base64,${btoa(String.fromCharCode(...new Uint8Array(imgData)))}`;

          const imgProps = await pdf.getImageProperties(dataUrl);
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

          if (y + imgHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }

          pdf.addImage(dataUrl, 'JPEG', margin, y, imgWidth, imgHeight);
          y += imgHeight + 10;
        }
      }

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
    }

    pdf.save("downloaded_epub.pdf");
  } catch (error: any) {
    console.error("Error building PDF:", error.message);
  }
};
