import * as Haptics from "expo-haptics";
import { Eye, EyeOff, Moon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenHeader } from "../components/ScreenHeader";
import { useApiKey } from "../hooks/useApiKey";
import { font, radius, softShadow } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

export default function Settings() {
  const { theme, isDark, toggleDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { apiKey, save } = useApiKey();
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);

  // Prefill the field once the stored key loads
  useEffect(() => { if (apiKey) setDraft(apiKey); }, [apiKey]);

  const onSave = async () => {
    if (!draft.trim()) return;
    await save(draft);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Your API key is stored securely on this device.");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Settings" subtitle="Make the app yours" />
      <ScrollView className="px-6" contentContainerStyle={{ gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View className="flex-row items-center p-5" style={{ backgroundColor: theme.card, borderRadius: radius.xl, gap: 14, ...softShadow }}>
          <View className="items-center justify-center" style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: theme.primarySoft }}>
            <Moon size={22} color={theme.primary} />
          </View>
          <View className="flex-1" style={{ gap: 2 }}>
            <Text style={{ color: theme.text, fontFamily: font.family.semibold, fontSize: font.size.base }}>Dark mode</Text>
            <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.sm }}>Easier on the eyes at night</Text>
          </View>
          <Switch value={isDark} onValueChange={toggleDark} trackColor={{ true: theme.primary, false: theme.cardAlt }} thumbColor="#FFFFFF" />
        </View>

        {/* API key */}
        <View className="p-5" style={{ backgroundColor: theme.card, borderRadius: radius.xl, gap: 12, ...softShadow }}>
          <Text style={{ color: theme.text, fontFamily: font.family.semibold, fontSize: font.size.base }}>Gemini API key</Text>
          <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.sm, lineHeight: 19 }}>
            Used for AI Document Transcription & Analyze. Stored securely on your device or configured via .env, never sent anywhere else.
          </Text>
          <View
            className="flex-row items-center px-4"
            style={{ borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.bg, height: 52, gap: 8 }}
          >
            <TextInput
              className="flex-1"
              value={draft}
              onChangeText={setDraft}
              placeholder="Paste your key here"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              style={{ color: theme.text, fontFamily: font.family.regular, fontSize: font.size.base }}
            />
            <Pressable onPress={() => setShow((s) => !s)} hitSlop={12}>
              {show ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
            </Pressable>
          </View>
          {/* TODO: validate the key with a lightweight Gemini ping before saving */}
          <PrimaryButton label="Save key" onPress={onSave} disabled={!draft.trim()} />
        </View>

        <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.xs, textAlign: "center", paddingTop: 8 }}>
          Pocket Tools · personal build · all processing on-device
        </Text>
      </ScrollView>
    </View>
  );
}
