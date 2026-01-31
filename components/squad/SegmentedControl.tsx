import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/contexts/theme-context";

interface SegmentedControlOption {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function SegmentedControl({ options, activeKey, onChange }: SegmentedControlProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 16,
        backgroundColor: colors.backgroundSecondary,
        padding: 4,
        gap: 4,
        alignSelf: "center",
      }}
    >
      {options.map((option) => {
        const isActive = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={{
              backgroundColor: isActive ? colors.accent : "transparent",
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 28,
            }}
          >
            <Text
              style={{
                color: isActive ? "white" : colors.textSecondary,
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
