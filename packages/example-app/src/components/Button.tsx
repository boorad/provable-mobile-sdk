import type React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { colors } from "@/styles/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  color?: string;
};

export const Button: React.FC<ButtonProps> = ({ title, onPress, color = "blue" }: ButtonProps) => {
  const themeColors = useThemeColors();

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors[color] }]}
        onPress={onPress}
      >
        <Text style={[styles.label, { color: themeColors.white }]}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 5,
    alignContent: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  label: {
    alignSelf: "center",
  },
});
