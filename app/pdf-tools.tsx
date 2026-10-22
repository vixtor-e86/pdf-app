import { FileOutput, Files, Images } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/PrimaryButton";
import { PressScale } from "../components/PressScale";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenHeader } from "../components/ScreenHeader";
import { useFilePicker } from "../hooks/useFilePicker";
import { useMockTask, TaskStatus } from "../hooks/useMockTask";
import { imagesToPdfSummary, mergePdfsSummary, pdfToImages } from "../services/pdfService";
import { font, radius, softShadow } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

// One list row per PDF tool; each runs its own mock task inline.
function PdfToolRow({
  icon, title, description, actionLabel, status, progress, result, onRun,
}: {
  icon: React.ReactNode; title: string; description: string; actionLabel: string;
  status: TaskStatus; progress: number; result: string | null; onRun: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View className="p-5" style={{ backgroundColor: theme.card, borderRadius: radius.xl, gap: 14, ...softShadow }}>
      <View className="flex-row items-center" style={{ gap: 14 }}>
        <View className="items-center justify-center" style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: theme.primarySoft }}>
          {icon}
        </View>
        <View className="flex-1" style={{ gap: 2 }}>
          <Text style={{ color: theme.text, fontFamily: font.family.semibold, fontSize: font.size.base }}>{title}</Text>
          <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.sm }}>{description}</Text>
        </View>
      </View>
      {status === "processing" && <ProgressBar progress={progress} />}
      {status === "success" && result && (
        <Text style={{ color: theme.success, fontFamily: font.family.medium, fontSize: font.size.sm }}>{result}</Text>
      )}
      <PrimaryButton label={actionLabel} loading={status === "processing"} onPress={onRun} />
    </View>
  );
}

export default function PdfTools() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const images = useFilePicker("image", true);
  const pdf = useFilePicker("pdf");
  const pdfs = useFilePicker("pdf", true);

  const t1 = useMockTask(imagesToPdfSummary);
  const t2 = useMockTask(pdfToImages);
  const t3 = useMockTask(mergePdfsSummary);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="PDF Tools" subtitle="Everyday PDF jobs, done on-device" />
      <ScrollView className="px-6" contentContainerStyle={{ gap: 16, paddingBottom: Math.max(insets.bottom + 24, 40) }} showsVerticalScrollIndicator={false}>
        <PdfToolRow
          icon={<Images size={24} color={theme.primary} />}
          title="Images to PDF"
          description="Combine photos into a single PDF"
          actionLabel="Choose images"
          status={t1.status} progress={t1.progress} result={t1.result}
          onRun={async () => { await images.pick(); t1.run(images.files); }}
        />
        <PdfToolRow
          icon={<FileOutput size={24} color={theme.primary} />}
          title="PDF to images"
          description="Export each page as a JPG"
          actionLabel="Choose a PDF"
          status={t2.status} progress={t2.progress} result={t2.result}
          onRun={async () => { await pdf.pick(); t2.run(pdf.file); }}
        />
        <PdfToolRow
          icon={<Files size={24} color={theme.primary} />}
          title="Merge PDFs"
          description="Stitch multiple PDFs into one"
          actionLabel="Choose PDFs"
          status={t3.status} progress={t3.progress} result={t3.result}
          onRun={async () => { await pdfs.pick(); t3.run(pdfs.files); }}
        />
        <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.xs, textAlign: "center", paddingTop: 4 }}>
          All processing happens on your phone. Files never leave the device.
        </Text>
      </ScrollView>
    </View>
  );
}
