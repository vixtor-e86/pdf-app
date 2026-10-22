import * as Haptics from "expo-haptics";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileArchive,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Lock,
  Merge,
  Pencil,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { BottomTabBar, TabKey } from "../components/BottomTabBar";
import { FileCard } from "../components/FileCard";
import { PressScale } from "../components/PressScale";
import { NotificationModal } from "../components/NotificationModal";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { RadioOptionCard } from "../components/RadioOptionCard";
import { ResultCard } from "../components/ResultCard";
import { PdfPageRenderer } from "../components/PdfPageRenderer";
import { SegmentedControl } from "../components/SegmentedControl";
import { SizeSlider } from "../components/SizeSlider";
import { UploadArea } from "../components/UploadArea";
import { recentFiles } from "../data/mockFiles";
import { useApiKey } from "../hooks/useApiKey";
import { useFilePicker } from "../hooks/useFilePicker";
import { useMockTask } from "../hooks/useMockTask";
import { extractTextWithGemini } from "../services/aiService";
import { compressFile, convertFile } from "../services/imageService";
import { mergeFiles } from "../services/pdfService";
import * as FileSystem from "expo-file-system/legacy";
import { PDFDocument } from "pdf-lib";
import * as Clipboard from "expo-clipboard";
import {
  exportTextFile,
  saveFileToDevice,
  shareFile,
} from "../services/fileActionService";
import {
  addProcessedFile,
  getProcessedFiles,
  ProcessedFileRecord,
  removeProcessedFile,
} from "../services/historyService";
import { checkInternetConnection } from "../utils/networkUtils";
import { cardShadow, font, radius, softShadow } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PickedFile } from "../types";
import { formatBytes } from "../utils/format";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("compress");

  // Compress state
  const compressPicker = useFilePicker("any");
  const activeCompressFile = compressPicker.file;

  const [compressMode, setCompressMode] = useState("fast");
  const [selectedQuality, setSelectedQuality] = useState("optimized");
  const [customTargetBytes, setCustomTargetBytes] = useState<number | null>(null);
  const compressTask = useMockTask(compressFile);

  // Convert state
  const [convertSubTab, setConvertSubTab] = useState<"format" | "text">("format");
  const [textExtractionMode, setTextExtractionMode] = useState<"markdown" | "plain">("markdown");
  const [copiedText, setCopiedText] = useState(false);
  const convertPicker = useFilePicker("any");
  const activeConvertFile = convertPicker.file;
  const [targetFormat, setTargetFormat] = useState("PDF");
  const convertTask = useMockTask(convertFile);
  const textTask = useMockTask(extractTextWithGemini);
  const { apiKey } = useApiKey();

  // State for AI Transcribe Output Rename
  const [customTextBaseName, setCustomTextBaseName] = useState("");
  const [isEditingTextName, setIsEditingTextName] = useState(false);
  const [editTextNameValue, setEditTextNameValue] = useState("");

  useEffect(() => {
    if (textTask.result) {
      const base = textTask.result.fileName.replace(/\.[^/.]+$/, "");
      setCustomTextBaseName(base);
      setEditTextNameValue(base);
      setIsEditingTextName(false);
    }
  }, [textTask.result]);

  // Merge state
  const mergePicker = useFilePicker("any", true);
  const activeMergeFiles = mergePicker.files;
  const mergeTask = useMockTask(mergeFiles);

  // In-app Notification Modal state (no ugly system prompt)
  const [notifyModal, setNotifyModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    fileName?: string;
    type?: "success" | "info" | "warn" | "error";
  }>({
    visible: false,
    title: "",
    message: "",
  });

  // Persistent processed files history
  const [processedHistory, setProcessedHistory] = useState<ProcessedFileRecord[]>([]);

  useEffect(() => {
    getProcessedFiles().then(setProcessedHistory);
  }, []);

  // Helper to trigger light haptics
  const notifyTap = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const showModalNotice = (
    title: string,
    message: string,
    fileName?: string,
    type: "success" | "info" | "warn" | "error" = "success"
  ) => {
    notifyTap();
    setNotifyModal({
      visible: true,
      title,
      message,
      fileName,
      type,
    });
  };

  const handleActionNotice = showModalNotice;

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.bg,
        paddingTop: Math.max(insets.top, 12),
      }}
    >
      {/* Invisible PDF to Image Page Renderer */}
      <PdfPageRenderer />

      {/* Top App Brand Header */}
      <AppHeader />

      {/* Main Content Area */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom + 24, 40),
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* TAB 1: COMPRESS (Matching left & middle reference phone) */}
        {/* ======================================================== */}
        {activeTab === "compress" && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 } as any}
            style={{ gap: 20 }}
          >
            {/* Hero Title Section */}
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  color: theme.text,
                  fontFamily: font.family.bold,
                  fontSize: font.size.title,
                  lineHeight: 34,
                }}
              >
                Shrink your{" "}
                <Text style={{ color: theme.primary }}>PDF & Images.</Text>
              </Text>
              <Text
                style={{
                  color: theme.textMuted,
                  fontFamily: font.family.regular,
                  fontSize: font.size.sm,
                  lineHeight: 20,
                }}
              >
                All compression happens 100% on your device. Fast, safe, and
                works completely without an internet connection.
              </Text>
            </View>

            {/* Status bar row */}
            <View className="flex-row items-center justify-between">
              <Text
                style={{
                  color: theme.text,
                  fontFamily: font.family.semibold,
                  fontSize: font.size.sm,
                }}
              >
                Your file
              </Text>

              <View
                className="px-3 py-1"
                style={{
                  backgroundColor: theme.primarySoft,
                  borderRadius: radius.pill,
                }}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontFamily: font.family.medium,
                    fontSize: font.size.xs,
                  }}
                >
                  Unlimited & Private
                </Text>
              </View>
            </View>

            {/* Upload Area / File Card */}
            <UploadArea
              file={activeCompressFile}
              label="Tap or click here to choose a file."
              hint="File size limit: 50MB · PDF, JPG, PNG"
              onPick={() => {
                compressPicker.pick();
              }}
              onRemove={() => {
                compressPicker.clear();
                compressTask.reset();
              }}
            />

            {/* Mode Selector & Option Cards (Active once file is chosen) */}
            {activeCompressFile && (
              <View style={{ gap: 16 }}>
                {/* Segmented Control */}
                <SegmentedControl
                  options={[
                    { key: "fast", label: "Fast Compression" },
                    { key: "desired", label: "Desired File Size" },
                  ]}
                  selected={compressMode}
                  onSelect={setCompressMode}
                />

                {/* File size info */}
                <View className="flex-row items-center justify-between px-1">
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontFamily: font.family.medium,
                      fontSize: font.size.sm,
                    }}
                  >
                    Current File Size:
                  </Text>
                  <Text
                    style={{
                      color: theme.text,
                      fontFamily: font.family.bold,
                      fontSize: font.size.sm,
                    }}
                  >
                    {formatBytes(activeCompressFile.size)}
                  </Text>
                </View>

                {/* Mode Selector Content */}
                {compressMode === "fast" ? (
                  /* 3 Fast Radio Options with Live Size Estimation */
                  <View style={{ gap: 10 }}>
                    {(() => {
                      const curBytes = activeCompressFile.size ?? 2_400_000;
                      const estBright = Math.round(curBytes * 0.75);
                      const estOptimized = Math.round(curBytes * 0.4);
                      const estRobust = Math.round(curBytes * 0.18);

                      return (
                        <>
                          <RadioOptionCard
                            option={{
                              key: "bright",
                              title: "Bright",
                              desc: `High quality · Est. ~${formatBytes(estBright)} (-25%)`,
                            }}
                            selected={selectedQuality === "bright"}
                            onSelect={() => setSelectedQuality("bright")}
                          />
                          <RadioOptionCard
                            option={{
                              key: "optimized",
                              title: "Optimized",
                              desc: `Balanced · Est. ~${formatBytes(estOptimized)} (-60%)`,
                              badge: "Recommended",
                            }}
                            selected={selectedQuality === "optimized"}
                            onSelect={() => setSelectedQuality("optimized")}
                          />
                          <RadioOptionCard
                            option={{
                              key: "robust",
                              title: "Robust",
                              desc: `Smallest size · Est. ~${formatBytes(estRobust)} (-82%)`,
                            }}
                            selected={selectedQuality === "robust"}
                            onSelect={() => setSelectedQuality("robust")}
                          />
                        </>
                      );
                    })()}
                  </View>
                ) : (
                  /* Desired File Size Mode with Interactive Glider (Slider) & Safety Bounds */
                  <View
                    className="p-4"
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: radius.xl,
                      borderWidth: 1,
                      borderColor: theme.border,
                      gap: 14,
                      ...cardShadow,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        style={{
                          color: theme.text,
                          fontFamily: font.family.bold,
                          fontSize: font.size.base,
                        }}
                      >
                        Adjust Target Size
                      </Text>
                      <View
                        className="px-2.5 py-0.5"
                        style={{
                          backgroundColor: activeCompressFile.isImage
                            ? theme.primarySoft
                            : "#FFF4E5",
                          borderRadius: radius.pill,
                        }}
                      >
                        <Text
                          style={{
                            color: activeCompressFile.isImage
                              ? theme.primary
                              : "#C05621",
                            fontFamily: font.family.semibold,
                            fontSize: 10,
                          }}
                        >
                          {activeCompressFile.isImage
                            ? "Image: Min 20 KB (Passport Safe)"
                            : "PDF: Min 80 KB (Text Quality Safe)"}
                        </Text>
                      </View>
                    </View>

                    {/* Interactive Glider Slider */}
                    {(() => {
                      const curBytes = activeCompressFile.size ?? 2_000_000;
                      const minSafeBytes = activeCompressFile.isImage
                        ? 20 * 1024
                        : 85 * 1024;
                      const targetBytes =
                        customTargetBytes ?? Math.round(curBytes * 0.4);

                      return (
                        <SizeSlider
                          minBytes={minSafeBytes}
                          maxBytes={curBytes}
                          currentBytes={targetBytes}
                          onChange={setCustomTargetBytes}
                        />
                      );
                    })()}
                  </View>
                )}

                {/* Progress bar during compression */}
                {compressTask.status === "processing" && (
                  <ProgressBar progress={compressTask.progress} />
                )}

                {/* Compress Button */}
                {(() => {
                  const curBytes = activeCompressFile.size ?? 2_000_000;
                  const targetBytes =
                    customTargetBytes ?? Math.round(curBytes * 0.4);

                  return (
                    <PrimaryButton
                      label={
                        compressMode === "desired"
                          ? `Compress to ${formatBytes(targetBytes)}`
                          : "Compress Now"
                      }
                      loading={compressTask.status === "processing"}
                      disabled={compressTask.status === "processing"}
                      onPress={() => {
                        if (compressMode === "desired") {
                          const multiplier = Math.min(
                            0.95,
                            Math.max(0.08, targetBytes / curBytes)
                          );
                          compressTask.run(activeCompressFile, multiplier);
                        } else {
                          const multiplier =
                            selectedQuality === "bright"
                              ? 0.75
                              : selectedQuality === "optimized"
                              ? 0.4
                              : 0.18;
                          compressTask.run(activeCompressFile, multiplier);
                        }
                      }}
                    />
                  );
                })()}

                {/* Result Card */}
                {compressTask.status === "success" && compressTask.result && (
                  <ResultCard
                    title="Compression Complete!"
                    thumbnailUri={compressTask.result.uri}
                    isImage={activeCompressFile?.isImage}
                    fileName={compressTask.result.name}
                    rows={[
                      {
                        label: "Original Size",
                        value: formatBytes(compressTask.result.beforeBytes),
                      },
                      {
                        label: "Compressed Size",
                        value: formatBytes(compressTask.result.afterBytes),
                      },
                      {
                        label: "Space Saved",
                        value: `-${compressTask.result.savedPercent}%`,
                        highlight: true,
                      },
                    ]}
                    onSave={async (customName) => {
                      notifyTap();
                      if (compressTask.result?.uri) {
                        const finalName =
                          customName || compressTask.result.name;
                        const res = await saveFileToDevice(
                          compressTask.result.uri,
                          finalName
                        );
                        if (res.success) {
                          addProcessedFile({
                            name: finalName,
                            kind: activeCompressFile?.isImage ? "image" : "pdf",
                            action: "compressed",
                            sizeBytes: compressTask.result.afterBytes,
                            originalSizeBytes: compressTask.result.beforeBytes,
                            savedBytes: Math.max(
                              0,
                              compressTask.result.beforeBytes -
                                compressTask.result.afterBytes
                            ),
                            uri: compressTask.result.uri,
                          }).then(setProcessedHistory);

                          showModalNotice(
                            "File Saved Successfully!",
                            `Your compressed file (${formatBytes(compressTask.result.afterBytes)}) is saved on your device storage as ${finalName}.`,
                            finalName,
                            "success"
                          );
                        }
                      }
                    }}
                    onShare={(customName) => {
                      notifyTap();
                      if (compressTask.result?.uri) {
                        const finalName =
                          customName || compressTask.result.name;
                        shareFile(
                          compressTask.result.uri,
                          undefined,
                          finalName
                        );
                      }
                    }}
                    onReset={() => {
                      compressPicker.clear();
                      compressTask.reset();
                    }}
                  />
                )}
              </View>
            )}
          </MotiView>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MERGE                                             */}
        {/* ======================================================== */}
        {activeTab === "merge" && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 } as any}
            style={{ gap: 20 }}
          >
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  color: theme.text,
                  fontFamily: font.family.bold,
                  fontSize: font.size.title,
                  lineHeight: 34,
                }}
              >
                Merge your <Text style={{ color: theme.primary }}>PDF files.</Text>
              </Text>
              <Text
                style={{
                  color: theme.textMuted,
                  fontFamily: font.family.regular,
                  fontSize: font.size.sm,
                  lineHeight: 20,
                }}
              >
                Combine multiple PDFs or photos into a single organized document
                without losing quality.
              </Text>
            </View>

            {/* List of files to merge */}
            {activeMergeFiles.length > 0 ? (
              <View style={{ gap: 12 }}>
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{
                      color: theme.text,
                      fontFamily: font.family.semibold,
                      fontSize: font.size.sm,
                    }}
                  >
                    Files to combine ({activeMergeFiles.length})
                  </Text>
                  <Pressable
                    onPress={() => {
                      mergePicker.clear();
                      mergeTask.reset();
                    }}
                  >
                    <Text
                      style={{
                        color: theme.error,
                        fontFamily: font.family.medium,
                        fontSize: font.size.xs,
                      }}
                    >
                      Clear all
                    </Text>
                  </Pressable>
                </View>

                {activeMergeFiles.map((file, idx) => (
                  <FileCard
                    key={`${file.name}-${idx}`}
                    file={file}
                    onRemove={() => {
                      mergePicker.removeFile(idx);
                    }}
                  />
                ))}

                {/* Add more button */}
                <Pressable
                  onPress={() => mergePicker.pick(true)}
                  className="flex-row items-center justify-center p-3.5"
                  style={{
                    backgroundColor: theme.cardAlt,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: theme.border,
                    gap: 6,
                  }}
                >
                  <Plus size={16} color={theme.text} />
                  <Text
                    style={{
                      color: theme.text,
                      fontFamily: font.family.semibold,
                      fontSize: font.size.sm,
                    }}
                  >
                    Add more documents
                  </Text>
                </Pressable>

                {mergeTask.status === "processing" && (
                  <ProgressBar progress={mergeTask.progress} />
                )}

                <PrimaryButton
                  label="Merge Files Now"
                  loading={mergeTask.status === "processing"}
                  onPress={() => mergeTask.run(activeMergeFiles)}
                />

                {mergeTask.status === "success" && mergeTask.result && (
                  <ResultCard
                    title="PDF Merge Successful!"
                    thumbnailUri={mergeTask.result.uri}
                    isImage={false}
                    fileName={mergeTask.result.name}
                    rows={[
                      {
                        label: "Resulting Document",
                        value: mergeTask.result.name,
                      },
                      {
                        label: "Total Files Merged",
                        value: `${mergeTask.result.filesCount} items`,
                      },
                      {
                        label: "Merged Size",
                        value: formatBytes(mergeTask.result.totalSizeBytes),
                        highlight: true,
                      },
                    ]}
                    onSave={async (customName) => {
                      notifyTap();
                      if (mergeTask.result?.uri) {
                        const finalName =
                          customName || mergeTask.result.name;
                        const res = await saveFileToDevice(
                          mergeTask.result.uri,
                          finalName,
                          "application/pdf"
                        );
                        if (res.success) {
                          addProcessedFile({
                            name: finalName,
                            kind: "pdf",
                            action: "merged",
                            sizeBytes: mergeTask.result.totalSizeBytes,
                            uri: mergeTask.result.uri,
                          }).then(setProcessedHistory);

                          showModalNotice(
                            "Merged PDF Saved!",
                            `Your combined document with ${mergeTask.result.filesCount} pages has been saved to your storage as ${finalName}.`,
                            finalName,
                            "success"
                          );
                        }
                      }
                    }}
                    onShare={(customName) => {
                      notifyTap();
                      if (mergeTask.result?.uri) {
                        const finalName =
                          customName || mergeTask.result.name;
                        shareFile(
                          mergeTask.result.uri,
                          "application/pdf",
                          finalName
                        );
                      }
                    }}
                    onReset={() => {
                      mergePicker.clear();
                      mergeTask.reset();
                    }}
                  />
                )}
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                <UploadArea
                  file={null}
                  label="Choose multiple PDFs or images to merge."
                  hint="Select 2 or more files · PDF, JPG, PNG"
                  onPick={mergePicker.pick}
                />
              </View>
            )}
          </MotiView>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CONVERT (Format Converter + AI Text Extractor)   */}
        {/* ======================================================== */}
        {activeTab === "convert" && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 } as any}
            style={{ gap: 20 }}
          >
            {/* Sub-tab Switcher: Format Converter vs AI Convert to Text */}
            <SegmentedControl
              options={[
                { key: "format", label: "Format Converter" },
                { key: "text", label: "Convert to Text (AI)" },
              ]}
              selected={convertSubTab}
              onSelect={(k) => setConvertSubTab(k as "format" | "text")}
            />

            {convertSubTab === "format" ? (
              /* --- SUBTAB 1: LOCAL FORMAT CONVERTER (PDF, JPG, PNG, WebP, BMP) --- */
              <View style={{ gap: 20 }}>
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      color: theme.text,
                      fontFamily: font.family.bold,
                      fontSize: font.size.title,
                      lineHeight: 34,
                    }}
                  >
                    Convert any{" "}
                    <Text style={{ color: theme.primary }}>file format.</Text>
                  </Text>
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontFamily: font.family.regular,
                      fontSize: font.size.sm,
                      lineHeight: 20,
                    }}
                  >
                    Switch between PDF, JPG, PNG, WebP, and BMP instantly on your
                    phone.
                  </Text>
                </View>

                <UploadArea
                  file={activeConvertFile}
                  label="Choose an image or PDF to convert."
                  hint="Supports PDF, JPG, PNG, WebP, BMP"
                  onPick={() => {
                    convertPicker.pick();
                  }}
                  onRemove={() => {
                    convertPicker.clear();
                    convertTask.reset();
                  }}
                />

                {activeConvertFile && (() => {
                  // Auto-detect source format and exclude it from target formats
                  const name = activeConvertFile.name.toLowerCase();
                  let detectedSource = "JPG";
                  if (name.endsWith(".pdf") || activeConvertFile.mimeType === "application/pdf") {
                    detectedSource = "PDF";
                  } else if (name.endsWith(".png") || activeConvertFile.mimeType === "image/png") {
                    detectedSource = "PNG";
                  } else if (name.endsWith(".jpg") || name.endsWith(".jpeg") || activeConvertFile.mimeType === "image/jpeg") {
                    detectedSource = "JPG";
                  } else if (name.endsWith(".webp") || activeConvertFile.mimeType === "image/webp") {
                    detectedSource = "WebP";
                  } else if (name.endsWith(".bmp") || activeConvertFile.mimeType === "image/bmp") {
                    detectedSource = "BMP";
                  } else {
                    detectedSource = activeConvertFile.isImage ? "JPG" : "PDF";
                  }

                  // Exclude the detected source format
                  const ALL_TARGETS = ["PDF", "JPG", "PNG", "WebP", "BMP"];
                  const availableTargets = ALL_TARGETS.filter((f) => f !== detectedSource);

                  const effectiveTarget = availableTargets.includes(targetFormat)
                    ? targetFormat
                    : availableTargets[0] || "JPG";

                  return (
                    <View style={{ gap: 16 }}>
                      <View className="flex-row items-center justify-between">
                        <Text
                          style={{
                            color: theme.text,
                            fontFamily: font.family.semibold,
                            fontSize: font.size.base,
                          }}
                        >
                          Convert to:
                        </Text>
                        <View
                          className="px-2.5 py-0.5"
                          style={{
                            backgroundColor: theme.primarySoft,
                            borderRadius: radius.pill,
                          }}
                        >
                          <Text
                            style={{
                              color: theme.primary,
                              fontFamily: font.family.semibold,
                              fontSize: 10,
                            }}
                          >
                            Source: {detectedSource} (Excluded)
                          </Text>
                        </View>
                      </View>

                      {/* Filtered format selection pills */}
                      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                        {availableTargets.map((fmt) => {
                          const active = effectiveTarget === fmt;
                          return (
                            <PressScale
                              key={fmt}
                              onPress={() => setTargetFormat(fmt)}
                              style={{ flex: 1, minWidth: 60 }}
                            >
                              <View
                                className="items-center justify-center py-3"
                                style={{
                                  borderRadius: radius.md,
                                  backgroundColor: active
                                    ? theme.primarySoft
                                    : theme.card,
                                  borderWidth: 1.5,
                                  borderColor: active
                                    ? theme.primary
                                    : theme.border,
                                }}
                              >
                                <Text
                                  style={{
                                    color: active ? theme.primary : theme.text,
                                    fontFamily: font.family.bold,
                                    fontSize: font.size.sm,
                                  }}
                                >
                                  {fmt}
                                </Text>
                              </View>
                            </PressScale>
                          );
                        })}
                      </View>

                      {convertTask.status === "processing" && (
                        <ProgressBar progress={convertTask.progress} />
                      )}

                      <PrimaryButton
                        label={`Convert to ${effectiveTarget}`}
                        loading={convertTask.status === "processing"}
                        onPress={() =>
                          convertTask.run(activeConvertFile, effectiveTarget)
                        }
                      />

                      {convertTask.status === "success" &&
                        convertTask.result && (
                          <ResultCard
                            title={`Converted to ${convertTask.result.format}!`}
                            thumbnailUri={convertTask.result.uri}
                            isImage={convertTask.result.format !== "PDF"}
                            fileName={convertTask.result.name}
                            rows={[
                              {
                                label: "Output Name",
                                value: convertTask.result.name,
                              },
                              {
                                label: "Target Format",
                                value: convertTask.result.format,
                              },
                              {
                                label: "Final Size",
                                value: formatBytes(convertTask.result.sizeBytes),
                                highlight: true,
                              },
                            ]}
                            onSave={async (customName) => {
                              notifyTap();
                              if (convertTask.result?.uri) {
                                const finalName =
                                  customName || convertTask.result.name;
                                const res = await saveFileToDevice(
                                  convertTask.result.uri,
                                  finalName
                                );
                                if (res.success) {
                                  addProcessedFile({
                                    name: finalName,
                                    kind:
                                      convertTask.result.format === "PDF"
                                        ? "pdf"
                                        : "image",
                                    action: "converted",
                                    sizeBytes: convertTask.result.sizeBytes,
                                    originalSizeBytes:
                                      convertTask.result.beforeBytes,
                                    uri: convertTask.result.uri,
                                  }).then(setProcessedHistory);

                                  showModalNotice(
                                    "File Converted & Saved!",
                                    `Your file was saved as ${finalName}.`,
                                    finalName,
                                    "success"
                                  );
                                }
                              }
                            }}
                            onShare={(customName) => {
                              notifyTap();
                              if (convertTask.result?.uri) {
                                const finalName =
                                  customName || convertTask.result.name;
                                shareFile(
                                  convertTask.result.uri,
                                  undefined,
                                  finalName
                                );
                              }
                            }}
                            onReset={() => {
                              convertPicker.clear();
                              convertTask.reset();
                            }}
                          />
                        )}
                    </View>
                  );
                })()}
              </View>
            ) : (
              /* --- SUBTAB 2: AI CONVERT TO TEXT (Powered by Gemini) --- */
              <View style={{ gap: 20 }}>
                <View style={{ gap: 6 }}>
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <Text
                      style={{
                        color: theme.text,
                        fontFamily: font.family.bold,
                        fontSize: font.size.title,
                        lineHeight: 34,
                      }}
                    >
                      Extract Text with{" "}
                      <Text style={{ color: theme.primary }}>Gemini AI.</Text>
                    </Text>
                    <View
                      className="px-2 py-0.5"
                      style={{
                        backgroundColor: theme.primarySoft,
                        borderRadius: radius.pill,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.primary,
                          fontFamily: font.family.bold,
                          fontSize: 10,
                        }}
                      >
                        OCR
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontFamily: font.family.regular,
                      fontSize: font.size.sm,
                      lineHeight: 20,
                    }}
                  >
                    Converts PDFs, Images, Excel sheets, and Scans into
                    structured text, formatted tables, and clean Markdown.
                  </Text>
                </View>

                {/* Supported file badge strip */}
                <View
                  className="p-3.5 flex-row items-center justify-between"
                  style={{
                    backgroundColor: theme.cardAlt,
                    borderRadius: radius.lg,
                  }}
                >
                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <Sparkles size={16} color={theme.primary} />
                    <Text
                      style={{
                        color: theme.text,
                        fontFamily: font.family.semibold,
                        fontSize: font.size.xs,
                      }}
                    >
                      Processes:
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontFamily: font.family.medium,
                      fontSize: font.size.xs,
                    }}
                  >
                    PDF · Images · Spreadsheets · Receipts
                  </Text>
                </View>

                {/* Upload Zone */}
                <UploadArea
                  file={activeConvertFile}
                  label="Select a document or photo to transcribe."
                  hint="PDF, JPG, PNG, CSV, Excel, Scans"
                  onPick={() => {
                    convertPicker.pick();
                  }}
                  onRemove={() => {
                    convertPicker.clear();
                    textTask.reset();
                  }}
                />

                {activeConvertFile && (
                  <View style={{ gap: 16 }}>
                    {/* Output formatting choices */}
                    <Text
                      style={{
                        color: theme.text,
                        fontFamily: font.family.semibold,
                        fontSize: font.size.base,
                      }}
                    >
                      Formatting Style:
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "stretch",
                      }}
                    >
                      {[
                        {
                          id: "markdown",
                          label: "Structured Markdown",
                          desc: "Preserves tables & headers",
                        },
                        {
                          id: "plain",
                          label: "Plain Text",
                          desc: "Clean unformatted text",
                        },
                      ].map((m) => {
                        const active = textExtractionMode === m.id;
                        return (
                          <PressScale
                            key={m.id}
                            onPress={() =>
                              setTextExtractionMode(
                                m.id as "markdown" | "plain"
                              )
                            }
                            style={{ flex: 1, flexBasis: 0, minWidth: 0 }}
                          >
                            <View
                              style={{
                                flex: 1,
                                minHeight: 76,
                                padding: 12,
                                borderRadius: radius.lg,
                                backgroundColor: active
                                  ? theme.primarySoft
                                  : theme.card,
                                borderWidth: 1.5,
                                borderColor: active
                                  ? theme.primary
                                  : theme.border,
                                justifyContent: "center",
                                gap: 3,
                              }}
                            >
                              <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                                style={{
                                  color: active ? theme.primary : theme.text,
                                  fontFamily: font.family.bold,
                                  fontSize: 13,
                                }}
                              >
                                {m.label}
                              </Text>
                              <Text
                                numberOfLines={2}
                                style={{
                                  color: theme.textMuted,
                                  fontFamily: font.family.regular,
                                  fontSize: 10.5,
                                }}
                              >
                                {m.desc}
                              </Text>
                            </View>
                          </PressScale>
                        );
                      })}
                    </View>

                    {textTask.status === "processing" && (
                      <ProgressBar progress={textTask.progress} />
                    )}

                    <PrimaryButton
                      label={
                        textTask.status === "processing"
                          ? "Transcribing with Gemini AI..."
                          : "Transcribe to Text with AI"
                      }
                      loading={textTask.status === "processing"}
                      onPress={async () => {
                        notifyTap();
                        if (!activeConvertFile) return;

                        // 1. Internet Connection Check
                        const isOnline = await checkInternetConnection();
                        if (!isOnline) {
                          showModalNotice(
                            "No Internet Connection",
                            "Transcribing documents with Gemini AI requires an active internet connection. Please connect to Wi-Fi or mobile data and try again.",
                            undefined,
                            "warn"
                          );
                          return;
                        }

                        // 2. Gemini API Key Check
                        const activeKey =
                          apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
                        if (
                          !activeKey ||
                          activeKey === "your_gemini_api_key_here"
                        ) {
                          showModalNotice(
                            "Gemini API Key Required",
                            "Please add your free Gemini API key to EXPO_PUBLIC_GEMINI_API_KEY in your .env file or enter your API key in Settings to transcribe documents.",
                            undefined,
                            "info"
                          );
                          return;
                        }

                        // 3. Run AI Transcription
                        try {
                          const res = await textTask.run(
                            activeConvertFile,
                            textExtractionMode,
                            activeKey
                          );
                          if (res) {
                            const ext =
                              textExtractionMode === "markdown" ? ".md" : ".txt";
                            const defaultOutName = `${res.fileName.replace(
                              /\.[^/.]+$/,
                              ""
                            )}${ext}`;
                            showModalNotice(
                              "File Ready!",
                              `Your document has been successfully transcribed with Gemini AI into ${
                                textExtractionMode === "markdown"
                                  ? "Structured Markdown"
                                  : "Plain Text"
                              }.`,
                              defaultOutName,
                              "success"
                            );
                          }
                        } catch (err: any) {
                          showModalNotice(
                            "Transcription Error",
                            err?.message ||
                              "Could not transcribe document with Gemini AI. Please check your connection and API key.",
                            undefined,
                            "error"
                          );
                        }
                      }}
                    />

                    {/* Result Card with Locked Extension Rename & Live Text Box */}
                    {textTask.status === "success" && textTask.result && (() => {
                      const currentExt =
                        textExtractionMode === "markdown" ? "md" : "txt";
                      const baseName =
                        customTextBaseName ||
                        textTask.result.fileName.replace(/\.[^/.]+$/, "");
                      const fullTranscribedName = `${baseName}.${currentExt}`;

                      return (
                        <View
                          className="p-5"
                          style={{
                            backgroundColor: theme.card,
                            borderRadius: radius.xxl,
                            borderWidth: 1,
                            borderColor: theme.border,
                            gap: 14,
                            ...cardShadow,
                          }}
                        >
                          {/* Header */}
                          <View className="flex-row items-center justify-between">
                            <View
                              className="flex-row items-center"
                              style={{ gap: 8 }}
                            >
                              <View
                                className="items-center justify-center"
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: radius.pill,
                                  backgroundColor: theme.successSoft,
                                }}
                              >
                                <CheckCircle2
                                  size={20}
                                  color={theme.success}
                                />
                              </View>
                              <View>
                                <Text
                                  style={{
                                    color: theme.text,
                                    fontFamily: font.family.bold,
                                    fontSize: font.size.base,
                                  }}
                                >
                                  Transcription Ready
                                </Text>
                                <Text
                                  style={{
                                    color: theme.success,
                                    fontFamily: font.family.medium,
                                    fontSize: 11,
                                  }}
                                >
                                  Powered by {textTask.result.modelUsed || "Gemini Flash"}
                                </Text>
                              </View>
                            </View>

                            <View
                              className="px-2.5 py-1"
                              style={{
                                backgroundColor: theme.cardAlt,
                                borderRadius: radius.pill,
                                borderWidth: 1,
                                borderColor: theme.border,
                              }}
                            >
                              <Text
                                style={{
                                  color: theme.textMuted,
                                  fontFamily: font.family.medium,
                                  fontSize: 11,
                                }}
                              >
                                {textTask.result.wordCount} words
                              </Text>
                            </View>
                          </View>

                          {/* Editable File Name Bar with Locked Extension */}
                          <View
                            style={{
                              backgroundColor: theme.cardAlt,
                              borderRadius: radius.lg,
                              borderWidth: 1.5,
                              borderColor: isEditingTextName
                                ? theme.primary
                                : theme.border,
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                            }}
                          >
                            {isEditingTextName ? (
                              <View
                                className="flex-row items-center"
                                style={{ gap: 8 }}
                              >
                                <View
                                  style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: theme.card,
                                    borderRadius: radius.md,
                                    borderWidth: 1.5,
                                    borderColor: theme.primary,
                                    paddingHorizontal: 8,
                                  }}
                                >
                                  <TextInput
                                    value={editTextNameValue}
                                    onChangeText={setEditTextNameValue}
                                    autoFocus
                                    selectTextOnFocus
                                    returnKeyType="done"
                                    onSubmitEditing={() => {
                                      const clean =
                                        editTextNameValue
                                          .trim()
                                          .replace(/\.[^/.]+$/, "") || baseName;
                                      setCustomTextBaseName(clean);
                                      setEditTextNameValue(clean);
                                      setIsEditingTextName(false);
                                    }}
                                    placeholder="Enter file name"
                                    placeholderTextColor={theme.textMuted}
                                    style={{
                                      flex: 1,
                                      color: theme.text,
                                      fontFamily: font.family.semibold,
                                      fontSize: font.size.sm,
                                      paddingVertical: 6,
                                    }}
                                  />
                                  <View
                                    className="flex-row items-center px-2 py-1 ml-1"
                                    style={{
                                      backgroundColor: theme.cardAlt,
                                      borderRadius: radius.sm,
                                      borderWidth: 1,
                                      borderColor: theme.border,
                                      gap: 3,
                                    }}
                                  >
                                    <Lock size={10} color={theme.textMuted} />
                                    <Text
                                      style={{
                                        color: theme.primary,
                                        fontFamily: font.family.bold,
                                        fontSize: 11,
                                      }}
                                    >
                                      .{currentExt}
                                    </Text>
                                  </View>
                                </View>

                                <Pressable
                                  onPress={() => {
                                    const clean =
                                      editTextNameValue
                                        .trim()
                                        .replace(/\.[^/.]+$/, "") || baseName;
                                    setCustomTextBaseName(clean);
                                    setEditTextNameValue(clean);
                                    setIsEditingTextName(false);
                                  }}
                                  style={{
                                    backgroundColor: theme.successSoft,
                                    padding: 8,
                                    borderRadius: radius.md,
                                    borderWidth: 1,
                                    borderColor: theme.success,
                                  }}
                                  hitSlop={8}
                                >
                                  <Check
                                    size={16}
                                    color={theme.success}
                                    strokeWidth={2.6}
                                  />
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    setEditTextNameValue(baseName);
                                    setIsEditingTextName(false);
                                  }}
                                  style={{
                                    backgroundColor: theme.card,
                                    padding: 8,
                                    borderRadius: radius.md,
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                  }}
                                  hitSlop={8}
                                >
                                  <X
                                    size={16}
                                    color={theme.textMuted}
                                    strokeWidth={2}
                                  />
                                </Pressable>
                              </View>
                            ) : (
                              <View
                                className="flex-row items-center justify-between"
                                style={{ gap: 10 }}
                              >
                                <View
                                  className="flex-row items-center flex-1"
                                  style={{ gap: 10, minWidth: 0 }}
                                >
                                  <View
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: radius.md,
                                      backgroundColor: theme.primarySoft,
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FileText
                                      size={16}
                                      color={theme.primary}
                                    />
                                  </View>
                                  <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text
                                      style={{
                                        color: theme.textMuted,
                                        fontFamily: font.family.medium,
                                        fontSize: 10,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                      }}
                                    >
                                      Output File Name (Extension Locked)
                                    </Text>
                                    <View
                                      className="flex-row items-center"
                                      style={{ gap: 4 }}
                                    >
                                      <Text
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                        style={{
                                          color: theme.text,
                                          fontFamily: font.family.semibold,
                                          fontSize: font.size.sm,
                                          flexShrink: 1,
                                        }}
                                      >
                                        {baseName}
                                      </Text>
                                      <View
                                        className="flex-row items-center px-1.5 py-0.5"
                                        style={{
                                          backgroundColor: theme.card,
                                          borderRadius: radius.sm,
                                          borderWidth: 1,
                                          borderColor: theme.border,
                                          gap: 3,
                                        }}
                                      >
                                        <Lock size={9} color={theme.textMuted} />
                                        <Text
                                          style={{
                                            color: theme.primary,
                                            fontFamily: font.family.bold,
                                            fontSize: 10,
                                          }}
                                        >
                                          .{currentExt}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                </View>

                                <Pressable
                                  onPress={() => {
                                    setEditTextNameValue(baseName);
                                    setIsEditingTextName(true);
                                  }}
                                  className="items-center justify-center flex-row"
                                  style={{
                                    backgroundColor: theme.card,
                                    borderRadius: radius.pill,
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    gap: 5,
                                  }}
                                  hitSlop={8}
                                >
                                  <Pencil size={13} color={theme.primary} />
                                  <Text
                                    style={{
                                      color: theme.primary,
                                      fontFamily: font.family.semibold,
                                      fontSize: font.size.xs,
                                    }}
                                  >
                                    Rename
                                  </Text>
                                </Pressable>
                              </View>
                            )}
                          </View>

                          {/* Extracted Text Box */}
                          <View
                            className="p-4"
                            style={{
                              backgroundColor: theme.cardAlt,
                              borderRadius: radius.lg,
                              maxHeight: 220,
                            }}
                          >
                            <ScrollView
                              nestedScrollEnabled
                              showsVerticalScrollIndicator
                            >
                              <Text
                                style={{
                                  color: theme.text,
                                  fontFamily: font.family.regular,
                                  fontSize: font.size.sm,
                                  lineHeight: 22,
                                }}
                              >
                                {textTask.result.extractedText}
                              </Text>
                            </ScrollView>
                          </View>

                          {/* Action Buttons: Save to Device, Share, Copy Text */}
                          <View className="flex-row" style={{ gap: 10 }}>
                            <View className="flex-1">
                              <PrimaryButton
                                label="Save to Device"
                                onPress={async () => {
                                  notifyTap();
                                  if (textTask.result?.extractedText) {
                                    const mime =
                                      textExtractionMode === "markdown"
                                        ? "text/markdown"
                                        : "text/plain";
                                    const res = await exportTextFile(
                                      textTask.result.extractedText,
                                      fullTranscribedName,
                                      mime
                                    );
                                    if (res.success) {
                                      addProcessedFile({
                                        name: fullTranscribedName,
                                        kind: "text",
                                        action: "extracted",
                                        sizeBytes:
                                          textTask.result.extractedText.length,
                                        uri: `${
                                          FileSystem.cacheDirectory ||
                                          FileSystem.documentDirectory
                                        }${fullTranscribedName}`,
                                      }).then(setProcessedHistory);

                                      showModalNotice(
                                        "File Saved Successfully!",
                                        `Your transcribed file has been saved to your device as ${fullTranscribedName}.`,
                                        fullTranscribedName,
                                        "success"
                                      );
                                    }
                                  }
                                }}
                              />
                            </View>

                            <View style={{ width: 95 }}>
                              <PrimaryButton
                                label="Share"
                                variant="outline"
                                onPress={async () => {
                                  notifyTap();
                                  if (textTask.result?.extractedText) {
                                    const destUri = `${
                                      FileSystem.cacheDirectory ||
                                      FileSystem.documentDirectory
                                    }${fullTranscribedName}`;
                                    await FileSystem.writeAsStringAsync(
                                      destUri,
                                      textTask.result.extractedText,
                                      { encoding: FileSystem.EncodingType.UTF8 }
                                    );
                                    shareFile(
                                      destUri,
                                      textExtractionMode === "markdown"
                                        ? "text/markdown"
                                        : "text/plain",
                                      fullTranscribedName
                                    );
                                  }
                                }}
                              />
                            </View>
                          </View>

                          {/* Copy Text secondary button */}
                          <PressScale
                            onPress={async () => {
                              notifyTap();
                              if (textTask.result?.extractedText) {
                                await Clipboard.setStringAsync(
                                  textTask.result.extractedText
                                );
                              }
                              setCopiedText(true);
                              setTimeout(() => setCopiedText(false), 2000);
                              showModalNotice(
                                "Copied to Clipboard!",
                                "The transcribed document text is ready to paste anywhere.",
                                undefined,
                                "success"
                              );
                            }}
                          >
                            <View
                              className="items-center justify-center flex-row py-3"
                              style={{
                                backgroundColor: copiedText
                                  ? theme.successSoft
                                  : theme.cardAlt,
                                borderRadius: radius.lg,
                                borderWidth: 1,
                                borderColor: theme.border,
                                gap: 6,
                              }}
                            >
                              {copiedText ? (
                                <Check size={16} color={theme.success} />
                              ) : (
                                <Copy size={16} color={theme.primary} />
                              )}
                              <Text
                                style={{
                                  color: copiedText
                                    ? theme.success
                                    : theme.primary,
                                  fontFamily: font.family.semibold,
                                  fontSize: font.size.sm,
                                }}
                              >
                                {copiedText ? "Copied!" : "Copy Full Text"}
                              </Text>
                            </View>
                          </PressScale>

                          <Text
                            onPress={() => {
                              convertPicker.clear();
                              textTask.reset();
                            }}
                            style={{
                              color: theme.textMuted,
                              fontFamily: font.family.medium,
                              fontSize: font.size.sm,
                              textAlign: "center",
                              paddingTop: 2,
                            }}
                          >
                            Transcribe another file
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                )}
              </View>
            )}
          </MotiView>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MY FILES / HISTORY                                */}
        {/* ======================================================== */}
        {activeTab === "my-files" && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 } as any}
            style={{ gap: 20 }}
          >
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  color: theme.text,
                  fontFamily: font.family.bold,
                  fontSize: font.size.title,
                  lineHeight: 34,
                }}
              >
                My <Text style={{ color: theme.primary }}>Processed Files.</Text>
              </Text>
              <Text
                style={{
                  color: theme.textMuted,
                  fontFamily: font.family.regular,
                  fontSize: font.size.sm,
                  lineHeight: 20,
                }}
              >
                Saved locally on your device storage. Never sent to remote
                servers.
              </Text>
            </View>

            {/* Storage Savings Banner */}
            {(() => {
              const totalSaved = processedHistory.reduce(
                (acc, f) => acc + (f.savedBytes ?? 0),
                0
              );
              return (
                <View
                  className="p-5 flex-row items-center"
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: radius.xxl,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 16,
                    ...cardShadow,
                  }}
                >
                  <View
                    className="items-center justify-center"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: radius.pill,
                      backgroundColor: theme.primarySoft,
                    }}
                  >
                    <FileArchive size={26} color={theme.primary} />
                  </View>

                  <View className="flex-1" style={{ gap: 2 }}>
                    <Text
                      style={{
                        color: theme.textMuted,
                        fontFamily: font.family.medium,
                        fontSize: font.size.xs,
                      }}
                    >
                      TOTAL LOCAL STORAGE SAVED
                    </Text>
                    <Text
                      style={{
                        color: theme.text,
                        fontFamily: font.family.bold,
                        fontSize: 22,
                      }}
                    >
                      {totalSaved > 0 ? formatBytes(totalSaved) : "0 KB"}
                    </Text>
                  </View>
                </View>
              );
            })()}

            {/* Recent processed files list */}
            <View style={{ gap: 12 }}>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    color: theme.text,
                    fontFamily: font.family.bold,
                    fontSize: font.size.base,
                  }}
                >
                  Processed Documents ({processedHistory.length})
                </Text>
              </View>

              {processedHistory.length === 0 ? (
                <View
                  className="p-8 items-center justify-center"
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: radius.xxl,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 12,
                  }}
                >
                  <View
                    className="items-center justify-center"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: radius.pill,
                      backgroundColor: theme.primarySoft,
                    }}
                  >
                    <FolderOpen size={26} color={theme.primary} />
                  </View>
                  <Text
                    style={{
                      color: theme.text,
                      fontFamily: font.family.bold,
                      fontSize: font.size.base,
                    }}
                  >
                    No Processed Files Yet
                  </Text>
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontFamily: font.family.regular,
                      fontSize: font.size.sm,
                      textAlign: "center",
                      maxWidth: 260,
                      lineHeight: 20,
                    }}
                  >
                    Files you compress, merge, or convert will be saved here on your device.
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <PrimaryButton
                      label="Compress a File"
                      onPress={() => setActiveTab("compress")}
                    />
                  </View>
                </View>
              ) : (
                processedHistory.map((file) => (
                  <View
                    key={file.id}
                    className="p-3.5 flex-row items-center"
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: radius.lg,
                      borderWidth: 1,
                      borderColor: theme.border,
                      gap: 12,
                      overflow: "hidden",
                      ...softShadow,
                    }}
                  >
                    <View
                      className="items-center justify-center"
                      style={{
                        width: 44,
                        height: 48,
                        borderRadius: radius.sm,
                        backgroundColor: theme.primarySoft,
                      }}
                    >
                      {file.kind === "pdf" ? (
                        <FileText size={20} color={theme.primary} />
                      ) : (
                        <ImageIcon size={20} color={theme.primary} />
                      )}
                      <Text
                        style={{
                          color: theme.primary,
                          fontFamily: font.family.bold,
                          fontSize: 8.5,
                          marginTop: 2,
                        }}
                      >
                        {file.kind.toUpperCase()}
                      </Text>
                    </View>

                    <View
                      className="flex-1"
                      style={{ gap: 2, minWidth: 0, overflow: "hidden" }}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        style={{
                          color: theme.text,
                          fontFamily: font.family.semibold,
                          fontSize: font.size.sm,
                        }}
                      >
                        {file.name}
                      </Text>
                      <View
                        className="flex-row items-center"
                        style={{ gap: 6 }}
                      >
                        <Text
                          style={{
                            color: theme.textMuted,
                            fontFamily: font.family.regular,
                            fontSize: font.size.xs,
                          }}
                        >
                          {formatBytes(file.sizeBytes)}
                        </Text>
                        {file.savedBytes && file.savedBytes > 0 && (
                          <Text
                            style={{
                              color: theme.success,
                              fontFamily: font.family.bold,
                              fontSize: font.size.xs,
                            }}
                          >
                            Saved {formatBytes(file.savedBytes)}
                          </Text>
                        )}
                        <Text
                          style={{
                            color: theme.textMuted,
                            fontFamily: font.family.regular,
                            fontSize: font.size.xs,
                          }}
                        >
                          · {new Date(file.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {/* Action buttons: Share & Delete */}
                    <View className="flex-row items-center" style={{ gap: 6 }}>
                      <Pressable
                        onPress={() => {
                          notifyTap();
                          shareFile(file.uri, undefined, file.name);
                        }}
                        hitSlop={8}
                        className="items-center justify-center"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: radius.pill,
                          backgroundColor: theme.cardAlt,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      >
                        <Share2 size={14} color={theme.text} />
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          notifyTap();
                          removeProcessedFile(file.id).then(setProcessedHistory);
                        }}
                        hitSlop={8}
                        className="items-center justify-center"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: radius.pill,
                          backgroundColor: theme.cardAlt,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      >
                        <Trash2 size={14} color={theme.textMuted} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </MotiView>
        )}
      </ScrollView>

      {/* Docked Modern Bottom Navigation Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* In-app Notification Modal (Replaces jarring system alerts) */}
      <NotificationModal
        visible={notifyModal.visible}
        title={notifyModal.title}
        message={notifyModal.message}
        fileName={notifyModal.fileName}
        type={notifyModal.type}
        onClose={() =>
          setNotifyModal((prev) => ({ ...prev, visible: false }))
        }
      />
    </View>
  );
}
