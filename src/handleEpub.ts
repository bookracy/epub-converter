import JSZip from "jszip";
import { DOMParser } from 'xmldom';

interface EpubItem {
  id: string;
  href: string;
  mediaType: string;
}

export const handleEpub = async (buffer: ArrayBuffer): Promise<{ htmlPages: string[], resources: Map<string, ArrayBuffer>, coverImage?: string, styles: string[], tocIndex: number }> => {
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
