import { forwardRef, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { Button, useToast } from "heroui-native";

import { useTheme } from "@/contexts/theme-context";
import type { MockReward } from "@/lib/mock";

interface RewardToasterProps {
  reward: MockReward | null;
  onDismiss: () => void;
}

export const RewardToaster = forwardRef<BottomSheetModal, RewardToasterProps>(
  ({ reward, onDismiss }, ref) => {
    const { colors } = useTheme();
    const { toast } = useToast();

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      []
    );

    const handleRedeem = useCallback(() => {
      toast.show({
        label: "Coming Soon",
        description: "Redemption will be available soon!",
        variant: "default",
        placement: "top",
      });
    }, [toast]);

    const renderPlaceholder = () => {
      if (!reward) return null;

      switch (reward.rewardType) {
        case "qr":
          return (
            <View className="items-center py-8">
              <View
                className="rounded-2xl items-center justify-center"
                style={{
                  width: 160,
                  height: 160,
                  backgroundColor: colors.cardBorder,
                }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  QR Code
                </Text>
              </View>
              <Text
                className="text-sm mt-3 font-mono"
                style={{ color: colors.textSecondary }}
              >
                {reward.rewardValue}
              </Text>
            </View>
          );

        case "barcode":
          return (
            <View className="items-center py-8">
              <View
                className="rounded-2xl items-center justify-center"
                style={{
                  width: 200,
                  height: 80,
                  backgroundColor: colors.cardBorder,
                }}
              >
                <Text
                  className="text-2xl font-mono tracking-tighter"
                  style={{ color: colors.textSecondary }}
                >
                  ||||||||||||
                </Text>
              </View>
              <Text
                className="text-sm mt-3 font-mono"
                style={{ color: colors.textSecondary }}
              >
                {reward.rewardValue}
              </Text>
            </View>
          );

        case "code":
          return (
            <View className="items-center py-8">
              <View
                className="rounded-2xl items-center justify-center px-6 py-4"
                style={{
                  borderWidth: 2,
                  borderColor: colors.primary,
                }}
              >
                <Text
                  className="text-2xl font-mono font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  {reward.rewardValue}
                </Text>
              </View>
            </View>
          );
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: colors.cardBackground }}
        handleIndicatorStyle={{ backgroundColor: colors.cardBorder }}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          {reward && (
            <>
              <View className="mb-6">
                <Text
                  className="text-xs font-medium uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  {reward.vendor}
                </Text>
                <Text
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  {reward.title}
                </Text>
                <Text
                  className="text-base"
                  style={{ color: colors.textSecondary }}
                >
                  {reward.description}
                </Text>
              </View>

              {renderPlaceholder()}

              <Button
                onPress={handleRedeem}
                className="w-full mt-4"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-semibold" style={{ color: "#FFFFFF" }}>
                  Redeem
                </Text>
              </Button>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

RewardToaster.displayName = "RewardToaster";
