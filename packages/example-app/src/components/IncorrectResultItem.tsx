import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

type IncorrectResultItemProps = {
  description: string;
  errorMsg: string;
};

export const IncorrectResultItem: React.FC<IncorrectResultItemProps> = ({
  description,
  errorMsg,
}: IncorrectResultItemProps) => {
  const emoji = "❌";
  const title = `${emoji} [${description}]`;
  const colors = useThemeColors();

  return (
    <View style={styles.itemContainer}>
      <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.error, { color: colors.red }]}>{errorMsg}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginVertical: 5,
  },
  text: {
    flexShrink: 1,
    fontSize: 9,
    paddingRight: 5,
  },
  error: {
    fontSize: 9,
    paddingRight: 5,
  },
});
