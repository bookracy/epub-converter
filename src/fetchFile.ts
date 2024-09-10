export const fetchFile = async (url: string): Promise<{ buffer: ArrayBuffer; mimeType: string }> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
    const blob = await response.blob();
    const mimeType = blob.type;
    const arrayBuffer = await blob.arrayBuffer();
    return { buffer: arrayBuffer, mimeType };
  };
  