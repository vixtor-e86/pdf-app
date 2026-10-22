import {
  FileArchive,
  FolderOpen,
  Merge,
  RefreshCw,
} from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font, softShadow } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

export type TabKey = "compress" | "merge" | "convert" | "my-files";

export function BottomTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "compress", label: "Compress", icon: FileArchive },
    { key: "merge", label: "Merge", icon: Merge },
    { key: "convert", label: "Convert", icon: RefreshCw },
    { key: "my-files", label: "My Files", icon: FolderOpen },
  ];

  return (
    <View
      className="flex-row items-center justify-around px-4 pt-2.5"
      style={{
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingBottom: Math.max(insets.bottom, 12),
        ...softShadow,
      }}
    >
      {tabs.map((t) => {
        const active = activeTab === t.key;
        const IconComponent = t.icon;

        return (
          <Pressable
            key={t.key}
            onPress={() => onTabChange(t.key)}
            className="items-center justify-center py-1"
            style={{ width: 72, gap: 4 }}
          >
            {/* Classic Icon */}
            <View
              className="items-center justify-center"
              style={{
                width: 38,
                height: 32,
              }}
            >
              <IconComponent
                size={active ? 24 : 20}
                color={active ? theme.primary : theme.textMuted}
                strokeWidth={active ? 2.4 : 1.8}
              />
            </View>

            {/* Tab Label */}
            <Text
              numberOfLines={1}
              style={{
                color: active ? theme.primary : theme.textMuted,
                fontFamily: active ? font.family.bold : font.family.medium,
                fontSize: 11,
                includeFontPadding: false,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
