/**
 * Generates a valid 24-bit Windows Bitmap (BMP) binary with full 54-byte header.
 * Conforms 100% to the Microsoft BMP specification so no OS or image viewer rejects it.
 */
export function createBmpBase64(
  width: number,
  height: number,
  r = 255,
  g = 255,
  b = 255
): string {
  const rowPadding = (4 - ((width * 3) % 4)) % 4;
  const rowSize = width * 3 + rowPadding;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const bytes = new Uint8Array(fileSize);

  // 1. BMP Header (14 bytes)
  bytes[0] = 0x42; // 'B'
  bytes[1] = 0x4d; // 'M'
  // File size (little-endian 32-bit uint)
  bytes[2] = fileSize & 0xff;
  bytes[3] = (fileSize >> 8) & 0xff;
  bytes[4] = (fileSize >> 16) & 0xff;
  bytes[5] = (fileSize >> 24) & 0xff;
  // Reserved (4 bytes = 0)
  bytes[6] = 0;
  bytes[7] = 0;
  bytes[8] = 0;
  bytes[9] = 0;
  // Pixel data offset (54 bytes)
  bytes[10] = 54;
  bytes[11] = 0;
  bytes[12] = 0;
  bytes[13] = 0;

  // 2. DIB Header / BITMAPINFOHEADER (40 bytes)
  bytes[14] = 40;
  bytes[15] = 0;
  bytes[16] = 0;
  bytes[17] = 0; // Header size
  // Width
  bytes[18] = width & 0xff;
  bytes[19] = (width >> 8) & 0xff;
  bytes[20] = (width >> 16) & 0xff;
  bytes[21] = (width >> 24) & 0xff;
  // Height
  bytes[22] = height & 0xff;
  bytes[23] = (height >> 8) & 0xff;
  bytes[24] = (height >> 16) & 0xff;
  bytes[25] = (height >> 24) & 0xff;
  // Color planes
  bytes[26] = 1;
  bytes[27] = 0;
  // Bits per pixel (24-bit RGB)
  bytes[28] = 24;
  bytes[29] = 0;
  // Compression (0 = BI_RGB)
  bytes[30] = 0;
  bytes[31] = 0;
  bytes[32] = 0;
  bytes[33] = 0;
  // Image size
  bytes[34] = pixelArraySize & 0xff;
  bytes[35] = (pixelArraySize >> 8) & 0xff;
  bytes[36] = (pixelArraySize >> 16) & 0xff;
  bytes[37] = (pixelArraySize >> 24) & 0xff;
  // Horizontal resolution (2835 ppm = 72 DPI)
  bytes[38] = 0x13;
  bytes[39] = 0x0b;
  bytes[40] = 0;
  bytes[41] = 0;
  // Vertical resolution (2835 ppm = 72 DPI)
  bytes[42] = 0x13;
  bytes[43] = 0x0b;
  bytes[44] = 0;
  bytes[45] = 0;
  // Colors in palette
  bytes[46] = 0;
  bytes[47] = 0;
  bytes[48] = 0;
  bytes[49] = 0;
  // Important colors
  bytes[50] = 0;
  bytes[51] = 0;
  bytes[52] = 0;
  bytes[53] = 0;

  // 3. Pixel Data (BGR order with 4-byte row padding)
  let offset = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      bytes[offset++] = b;
      bytes[offset++] = g;
      bytes[offset++] = r;
    }
    for (let p = 0; p < rowPadding; p++) {
      bytes[offset++] = 0;
    }
  }

  // Convert Uint8Array to Base64 string
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa !== "undefined" ? btoa(binary) : "";
}
