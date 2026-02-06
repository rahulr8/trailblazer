import { useEffect } from "react";

import { Image, StyleSheet, View } from "react-native";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { BorderRadius } from "@/constants";

interface RotatingLogoProps {
  size?: number;
}

export function RotatingLogo({ size = 80 }: RotatingLogoProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.logoWrapper, { width: size, height: size }, animatedStyle]}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={[
            styles.logo,
            {
              width: size,
              height: size,
              borderRadius: size * 0.22,
            },
          ]}
        />
      </Animated.View>
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
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  logo: {
    resizeMode: "cover",
  },
  glow: {
    position: "absolute",
    backgroundColor: "rgba(0, 242, 255, 0.06)",
  },
});
