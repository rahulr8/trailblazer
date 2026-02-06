import { Image, StyleSheet, View } from "react-native";

interface RotatingLogoProps {
  size?: number;
}

export function RotatingLogo({ size = 80 }: RotatingLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require("@/assets/images/icon.png")}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
        }}
        resizeMode="cover"
      />
      <View
        style={[
          styles.glow,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    backgroundColor: "rgba(0, 242, 255, 0.06)",
  },
});
