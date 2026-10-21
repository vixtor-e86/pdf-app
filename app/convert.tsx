import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { ResultCard } from "../components/ResultCard";
import { ScreenHeader } from "../components/ScreenHeader";
import { UploadArea } from "../components/UploadArea";
import { PressScale } from "../components/PressScale";
import { useFilePicker } from "../hooks/useFilePicker";
import { useMockTask } from "../hooks/useMockTask";
import { convertImage } from "../services/imageService";
import { saveFileToDevice, shareFile } from "../services/fileActionService";
import { font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { formatBytes } from "../utils/format";

const FORMATS = ["JPG", "PNG", "WebP", "BMP"];

export default function Convert() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { file, pick } = useFilePicker("image");
  const [format, setFormat] = useState("WebP");
  const task = useMockTask(convertImage);

  const onSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (task.result?.uri) {
      saveFileToDevice(task.result.uri, task.result.name);
    }
  };

  const onShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (task.result?.uri) {
      shareFile(task.result.uri, undefined, task.result.name);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Convert Image" subtitle="Switch formats without leaving your phone" />
      <ScrollView className="px-6" contentContainerStyle={{ gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <UploadArea file={file} label="Choose an image" hint="Any common image format" onPick={pick} />

        {/* Format selector */}
        <View style={{ gap: 10 }}>
          <Text style={{ color: theme.text, fontFamily: font.family.semibold, fontSize: font.size.base }}>Convert to</Text>
          <View className="flex-row" style={{ gap: 10 }}>
            {FORMATS.map((f) => {
              const active = format === f;
              return (
                <PressScale key={f} onPress={() => setFormat(f)} style={{ flex: 1 }}>
                  <View
                    className="items-center justify-center"
                    style={{
                      height: 48, borderRadius: radius.md,
                      backgroundColor: active ? theme.primarySoft : theme.card,
                      borderWidth: 1.5, borderColor: active ? theme.primary : theme.border,
                    }}
                  >
                    <Text style={{ color: active ? theme.primary : theme.text, fontFamily: font.family.semibold, fontSize: font.size.sm }}>{f}</Text>
                  </View>
                </PressScale>
              );
            })}
          </View>
        </View>

        {task.status === "processing" && <ProgressBar progress={task.progress} />}
        {task.status === "error" && (
          <Text style={{ color: theme.error, fontFamily: font.family.medium, fontSize: font.size.sm }}>{task.error}</Text>
        )}

        <PrimaryButton label="Convert" loading={task.status === "processing"} disabled={!file} onPress={() => file && task.run(file, format)} />

        {task.status === "success" && task.result && (
          <ResultCard
            title={`Converted to ${task.result.format}`}
            rows={[
              { label: "Output format", value: task.result.format },
              { label: "New size", value: formatBytes(task.result.sizeBytes) },
            ]}
          >
            <View className="flex-row pt-2" style={{ gap: 10 }}>
              <View className="flex-1"><PrimaryButton label="Save" onPress={onSave} /></View>
              <View className="flex-1"><PrimaryButton label="Share" onPress={onShare} /></View>
            </View>
          </ResultCard>
        )}
      </ScrollView>
    </View>
  );
}
