import { useEffect, useRef } from "react";

import { Animated, Easing, StyleSheet, View } from "react-native";

interface RotatingLogoProps {
  size?: number;
}

export function RotatingLogo({ size = 80 }: RotatingLogoProps) {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.Image
        source={require("@/assets/images/icon.png")}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          transform: [{ rotate }],
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
