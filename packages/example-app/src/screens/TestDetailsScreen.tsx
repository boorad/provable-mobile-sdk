import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { CorrectResultItem } from "@/components/CorrectResultItem";
import { IncorrectResultItem } from "@/components/IncorrectResultItem";
import { Suite } from "@/components/Suite";
import { useThemeColors } from "@/hooks/useThemeColors";
import { colors } from "@/styles/colors";
import type { TestResult } from "@/types/Results";

type RouteParams = {
  results: TestResult[];
  suiteName: string;
};

// @ts-expect-error - not dealing with navigation types rn
export const TestDetailsScreen = ({ route }) => {
  const { results, suiteName }: RouteParams = route.params;
  const [showFailed, setShowFailed] = useState<boolean>(true);
  const [showPassed, setShowPassed] = useState<boolean>(true);
  const themeColors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Test Results for '{suiteName}' Suite
        </Text>
      </View>
      <View style={styles.showMenu}>
        <View style={styles.showMenuItem}>
          <BouncyCheckbox
            isChecked={showFailed}
            onPress={() => setShowFailed(!showFailed)}
            disableText={true}
            fillColor="red"
            style={styles.checkbox}
          />
          <Text style={[styles.showMenuLabel, { color: themeColors.text }]}>Show Failed</Text>
        </View>
        <View style={styles.showMenuItem}>
          <BouncyCheckbox
            isChecked={showPassed}
            onPress={() => setShowPassed(!showPassed)}
            disableText={true}
            fillColor={colors.green}
            style={styles.checkbox}
          />
          <Text style={[styles.showMenuLabel, { color: themeColors.text }]}>Show Passed</Text>
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {results.map((it, index: number) => {
          // Create a stable key using description, type, and index as fallback
          const stableKey = `${it.type}-${it.description}-${index}`;

          let InnerElement = <View key={stableKey} />;
          if (showPassed && it.type === "correct") {
            InnerElement = <CorrectResultItem key={stableKey} description={it.description} />;
          }
          if (showFailed && it.type === "incorrect") {
            const errorMsg = it.errorMsg || ""; // Trick TS - How to do it as it should be? :)
            InnerElement = (
              <IncorrectResultItem
                key={stableKey}
                description={it.description}
                errorMsg={errorMsg}
              />
            );
          }
          if (it.type === "grouping") {
            InnerElement = <Suite key={stableKey} description={it.description} />;
          }
          return InnerElement;
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    paddingVertical: 5,
  },
  showMenu: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    paddingBottom: 5,
  },
  showMenuItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  showMenuLabel: {
    paddingLeft: 5,
  },
  scroll: {
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 5,
  },
  checkbox: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});
