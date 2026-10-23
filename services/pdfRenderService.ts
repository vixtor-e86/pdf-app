export const PDF_RENDERER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    canvas {
      display: none;
    }
  </style>
</head>
<body>
  <canvas id="the-canvas"></canvas>
  <script>
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    function sendToNative(data) {
      var msg = typeof data === 'string' ? data : JSON.stringify(data);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      }
    }

    sendToNative({ type: 'READY' });

    function bmpFromCanvas(canvas) {
      var ctx = canvas.getContext('2d');
      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var width = canvas.width;
      var height = canvas.height;
      var rowPadding = (4 - ((width * 3) % 4)) % 4;
      var rowSize = width * 3 + rowPadding;
      var pixelArraySize = rowSize * height;
      var fileSize = 54 + pixelArraySize;
      var buffer = new ArrayBuffer(fileSize);
      var view = new DataView(buffer);
      var bytes = new Uint8Array(buffer);

      // 1. BMP Header (14 bytes)
      bytes[0] = 0x42; bytes[1] = 0x4d; // 'BM'
      view.setUint32(2, fileSize, true);
      view.setUint32(6, 0, true);
      view.setUint32(10, 54, true);

      // 2. DIB Header (40 bytes)
      view.setUint32(14, 40, true);
      view.setInt32(18, width, true);
      view.setInt32(22, height, true);
      view.setUint16(26, 1, true);
      view.setUint16(28, 24, true);
      view.setUint32(30, 0, true);
      view.setUint32(34, pixelArraySize, true);

      var srcData = imgData.data;
      var offset = 54;
      for (var y = height - 1; y >= 0; y--) {
        for (var x = 0; x < width; x++) {
          var srcIdx = (y * width + x) * 4;
          bytes[offset++] = srcData[srcIdx + 2]; // B
          bytes[offset++] = srcData[srcIdx + 1]; // G
          bytes[offset++] = srcData[srcIdx];     // R
        }
        for (var p = 0; p < rowPadding; p++) {
          bytes[offset++] = 0;
        }
      }

      var binary = '';
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return 'data:image/bmp;base64,' + btoa(binary);
    }

    async function handleConvertImageRequest(base64Data, format) {
      try {
        var img = new Image();
        img.onload = function() {
          try {
            var canvas = document.getElementById('the-canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            var cleanFmt = (format || 'BMP').toUpperCase();
            var dataUrl = '';
            if (cleanFmt === 'BMP') {
              dataUrl = bmpFromCanvas(canvas);
            } else if (cleanFmt === 'PNG') {
              dataUrl = canvas.toDataURL('image/png', 1.0);
            } else if (cleanFmt === 'WEBP') {
              dataUrl = canvas.toDataURL('image/webp', 0.94);
            } else {
              dataUrl = canvas.toDataURL('image/jpeg', 0.94);
            }

            sendToNative({
              type: 'SUCCESS',
              dataUrl: dataUrl,
              width: canvas.width,
              height: canvas.height
            });
          } catch (innerErr) {
            sendToNative({ type: 'ERROR', message: innerErr.message || 'Canvas processing error' });
          }
        };
        img.onerror = function() {
          sendToNative({ type: 'ERROR', message: 'Failed to decode image data' });
        };

        if (base64Data.indexOf('data:') === 0) {
          img.src = base64Data;
        } else {
          img.src = 'data:image/png;base64,' + base64Data;
        }
      } catch (err) {
        sendToNative({
          type: 'ERROR',
          message: err.message || 'Failed to process image'
        });
      }
    }

    async function handleRenderRequest(base64Data, pageNum, scale, format) {
      try {
        if (!window.pdfjsLib) {
          sendToNative({ type: 'ERROR', message: 'PDF engine not loaded yet' });
          return;
        }

        var binaryString = atob(base64Data);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        var loadingTask = pdfjsLib.getDocument({ data: bytes });
        var pdfDoc = await loadingTask.promise;
        var page = await pdfDoc.getPage(pageNum || 1);

        var renderScale = scale || 2.0; // Crisp 2x retina rendering
        var viewport = page.getViewport({ scale: renderScale });
        var canvas = document.getElementById('the-canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Solid white paper background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        var cleanFmt = (format || 'JPEG').toUpperCase();
        var dataUrl = '';

        if (cleanFmt === 'PNG') {
          dataUrl = canvas.toDataURL('image/png', 1.0);
        } else if (cleanFmt === 'WEBP') {
          dataUrl = canvas.toDataURL('image/webp', 0.94);
        } else if (cleanFmt === 'BMP') {
          dataUrl = bmpFromCanvas(canvas);
        } else {
          dataUrl = canvas.toDataURL('image/jpeg', 0.94);
        }

        sendToNative({
          type: 'SUCCESS',
          dataUrl: dataUrl,
          width: viewport.width,
          height: viewport.height,
          totalPages: pdfDoc.numPages
        });
      } catch (err) {
        sendToNative({
          type: 'ERROR',
          message: err.message || 'Failed to render PDF page'
        });
      }
    }

    function onIncomingMessage(raw) {
      try {
        var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (data.action === 'RENDER') {
          handleRenderRequest(data.base64, data.page, data.scale, data.format);
        } else if (data.action === 'CONVERT_IMAGE') {
          handleConvertImageRequest(data.base64, data.format);
        }
      } catch (e) {
        sendToNative({ type: 'ERROR', message: 'Invalid render message' });
      }
    }

    window.addEventListener('message', function(e) { onIncomingMessage(e.data); });
    document.addEventListener('message', function(e) { onIncomingMessage(e.data); });
  </script>
</body>
</html>
`;

type RenderRequest = {
  resolve: (dataUrl: string) => void;
  reject: (err: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

let currentRequest: RenderRequest | null = null;
let postMessageToWebView: ((msg: string) => void) | null = null;

export function registerPdfRendererPostMessage(fn: (msg: string) => void) {
  postMessageToWebView = fn;
}

export function handlePdfRendererMessage(dataString: string) {
  try {
    const data = JSON.parse(dataString);
    if (data.type === "SUCCESS" && currentRequest) {
      clearTimeout(currentRequest.timeoutId);
      currentRequest.resolve(data.dataUrl);
      currentRequest = null;
      return;
    }
    if (data.type === "ERROR" && currentRequest) {
      clearTimeout(currentRequest.timeoutId);
      currentRequest.reject(new Error(data.message || "PDF render error"));
      currentRequest = null;
      return;
    }
  } catch (err) {
    console.warn("handlePdfRendererMessage parse error:", err);
  }
}

/**
 * Converts any image (PNG, JPG, WebP) to a genuine 24-bit BMP binary with real image pixels.
 */
export async function renderImageToBmpDataUrl(
  base64Image: string
): Promise<string> {
  const sender = postMessageToWebView;
  if (!sender) {
    throw new Error(
      "Renderer is not mounted. Please ensure the app is open."
    );
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (currentRequest) {
        currentRequest.reject(
          new Error("Image to BMP render timed out. Please try again.")
        );
        currentRequest = null;
      }
    }, 20000);

    currentRequest = {
      resolve,
      reject,
      timeoutId,
    };

    const payload = JSON.stringify({
      action: "CONVERT_IMAGE",
      base64: base64Image,
      format: "BMP",
    });

    sender(payload);
  });
}

/**
 * Renders a PDF page to a genuine raster image data URL using PDF.js.
 */
export async function renderPdfToImageDataUrl(
  base64: string,
  format: string = "JPEG",
  page: number = 1
): Promise<string> {
  const sender = postMessageToWebView;
  if (!sender) {
    throw new Error(
      "PDF renderer is not mounted. Please ensure the app is open."
    );
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (currentRequest) {
        currentRequest.reject(
          new Error("PDF to image render timed out. Please try again.")
        );
        currentRequest = null;
      }
    }, 30000);

    currentRequest = {
      resolve,
      reject,
      timeoutId,
    };

    const payload = JSON.stringify({
      action: "RENDER",
      base64,
      page,
      format: format.toUpperCase(),
      scale: 2.0,
    });

    sender(payload);
  });
}
