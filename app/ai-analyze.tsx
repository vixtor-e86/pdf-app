import { useRouter } from "expo-router";
import { AlertCircle, CheckCircle2, Info, KeyRound } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/PrimaryButton";
import { PressScale } from "../components/PressScale";
import { ScreenHeader } from "../components/ScreenHeader";
import { ShimmerCard } from "../components/ShimmerCard";
import { UploadArea } from "../components/UploadArea";
import { useApiKey } from "../hooks/useApiKey";
import { useFilePicker } from "../hooks/useFilePicker";
import { useMockTask } from "../hooks/useMockTask";
import { AiInsight, analyzeFile } from "../services/aiService";
import { font, radius, softShadow } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

const TONE_ICON = {
  success: CheckCircle2,
  info: Info,
  warn: AlertCircle,
} as const;

export default function AiAnalyze() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { file, pick } = useFilePicker("any");
  const { apiKey } = useApiKey();
  const task = useMockTask(analyzeFile);

  const toneColor = (t: AiInsight["tone"]) =>
    t === "success" ? theme.success : t === "warn" ? "#D9A441" : theme.primary;
  const toneBg = (t: AiInsight["tone"]) =>
    t === "success" ? theme.successSoft : t === "warn" ? "#F7EEDD" : theme.primarySoft;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="AI Analyze" subtitle="Friendly feedback on your files, powered by Gemini" />
      <ScrollView className="px-6" contentContainerStyle={{ gap: 20, paddingBottom: Math.max(insets.bottom + 24, 40) }} showsVerticalScrollIndicator={false}>
        {/* Gentle nudge when no key is stored yet */}
        {!apiKey && (
          <PressScale onPress={() => router.push("/settings")} scaleTo={0.98}>
            <View className="flex-row items-center p-4" style={{ backgroundColor: theme.primarySoft, borderRadius: radius.lg, gap: 12 }}>
              <KeyRound size={20} color={theme.primary} />
              <Text className="flex-1" style={{ color: theme.primary, fontFamily: font.family.medium, fontSize: font.size.sm }}>
                Add your Gemini API key in Settings to enable analysis.
              </Text>
            </View>
          </PressScale>
        )}

        <UploadArea file={file} label="Choose a file" hint="PDF or image — analyzed privately with your own key" onPick={pick} />

        {task.status === "error" && (
          <Text style={{ color: theme.error, fontFamily: font.family.medium, fontSize: font.size.sm }}>{task.error}</Text>
        )}

        <PrimaryButton
          label="Analyze"
          loading={task.status === "processing"}
          disabled={!file}
          onPress={() => file && task.run(file, apiKey)}
        />

        {/* Loading shimmer */}
        {task.status === "processing" && (
          <View style={{ gap: 14 }}>
            <ShimmerCard /><ShimmerCard /><ShimmerCard />
          </View>
        )}

        {/* Soft insight cards */}
        {task.status === "success" && task.result && (
          <View style={{ gap: 14 }}>
            {task.result.map((insight, i) => {
              const Icon = TONE_ICON[insight.tone];
              return (
                <MotiView
                  key={insight.title}
                  from={{ opacity: 0, translateY: 14 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 380, delay: i * 120 } as any}
                >
                  <View className="p-5" style={{ backgroundColor: theme.card, borderRadius: radius.xl, gap: 8, ...softShadow }}>
                    <View className="flex-row items-center" style={{ gap: 10 }}>
                      <View className="items-center justify-center" style={{ width: 34, height: 34, borderRadius: radius.pill, backgroundColor: toneBg(insight.tone) }}>
                        <Icon size={18} color={toneColor(insight.tone)} />
                      </View>
                      <Text className="flex-1" style={{ color: theme.text, fontFamily: font.family.semibold, fontSize: font.size.base }}>
                        {insight.title}
                      </Text>
                    </View>
                    <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.sm, lineHeight: 20 }}>
                      {insight.body}
                    </Text>
                  </View>
                </MotiView>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
