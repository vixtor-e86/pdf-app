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
import { compressImage } from "../services/imageService";
import { saveFileToDevice, shareFile } from "../services/fileActionService";
import { font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { formatBytes } from "../utils/format";

// Target-size presets standing in for a quality slider
const PRESETS = [
  { key: "high", label: "High quality", desc: "Light savings", quality: 0.85 },
  { key: "balanced", label: "Balanced", desc: "Recommended", quality: 0.6 },
  { key: "small", label: "Small size", desc: "Maximum savings", quality: 0.35 },
];

export default function Compress() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { file, pick } = useFilePicker("image");
  const [preset, setPreset] = useState(PRESETS[1]);
  const task = useMockTask(compressImage);

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
      <ScreenHeader title="Compress Image" subtitle="Make images lighter, keep them looking great" />
      <ScrollView className="px-6" contentContainerStyle={{ gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <UploadArea file={file} label="Choose an image" hint="JPG or PNG from your library" onPick={pick} />

        {/* Quality presets */}
        <View style={{ gap: 10 }}>
          <Text style={{ color: theme.text, fontFamily: font.family.semibold, fontSize: font.size.base }}>Target quality</Text>
          <View className="flex-row" style={{ gap: 10 }}>
            {PRESETS.map((p) => {
              const active = preset.key === p.key;
              return (
                <PressScale key={p.key} onPress={() => setPreset(p)} style={{ flex: 1 }}>
                  <View
                    className="items-center p-3"
                    style={{
                      borderRadius: radius.md, gap: 2,
                      backgroundColor: active ? theme.primarySoft : theme.card,
                      borderWidth: 1.5, borderColor: active ? theme.primary : theme.border,
                    }}
                  >
                    <Text style={{ color: active ? theme.primary : theme.text, fontFamily: font.family.semibold, fontSize: font.size.sm }}>{p.label}</Text>
                    <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.xs }}>{p.desc}</Text>
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

        <PrimaryButton label="Compress" loading={task.status === "processing"} disabled={!file} onPress={() => file && task.run(file, preset.quality)} />

        {task.status === "success" && task.result && (
          <ResultCard
            title="Compression complete"
            rows={[
              { label: "Before", value: formatBytes(task.result.beforeBytes) },
              { label: "After", value: formatBytes(task.result.afterBytes) },
              { label: "Saved", value: `${Math.round((1 - task.result.afterBytes / task.result.beforeBytes) * 100)}%` },
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
