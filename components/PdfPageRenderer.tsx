import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import {
  handlePdfRendererMessage,
  PDF_RENDERER_HTML,
  registerPdfRendererPostMessage,
} from "../services/pdfRenderService";

/**
 * Invisible background WebView that houses the PDF.js canvas renderer.
 * Enables 100% on-device PDF-to-Image rendering without cloud servers.
 */
export function PdfPageRenderer() {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    registerPdfRendererPostMessage((msg: string) => {
      webViewRef.current?.postMessage(msg);
    });
  }, []);

  return (
    <View
      style={{
        width: 0,
        height: 0,
        position: "absolute",
        top: -2000,
        left: -2000,
        opacity: 0,
      }}
      pointerEvents="none"
    >
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: PDF_RENDERER_HTML }}
        onMessage={(e) => handlePdfRendererMessage(e.nativeEvent.data)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
      />
    </View>
  );
}
