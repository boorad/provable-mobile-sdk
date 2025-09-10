import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

type CorrectResultItemProps = {
  description: string;
};

export const CorrectResultItem: React.FC<CorrectResultItemProps> = ({
  description,
}: CorrectResultItemProps) => {
  const emoji = "✅";
  const colors = useThemeColors();

  return (
    <View style={styles.itemContainer}>
      <Text style={[styles.text, { color: colors.text }]}>{emoji}</Text>
      <Text style={[styles.text, { color: colors.text }]}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    paddingHorizontal: 5,
    marginVertical: 2,
  },
  text: {
    flexShrink: 1,
    fontSize: 9,
    paddingRight: 5,
  },
});
