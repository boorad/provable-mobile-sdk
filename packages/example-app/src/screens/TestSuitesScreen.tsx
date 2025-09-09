import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { TestItem } from "@/components/TestItem";
import { useTestsList } from "@/hooks/useTestsList";
import { useTestsRun } from "@/hooks/useTestsRun";
import { useThemeColors } from "@/hooks/useThemeColors";

export const TestSuitesScreen = () => {
  const [suites, toggle, clearAll, checkAll] = useTestsList();
  const [results, runTests] = useTestsRun();
  const colors = useThemeColors();
  let totalCount = 0;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {Object.entries(suites).map(([suiteName, suite], index) => {
          const suiteTestCount = Object.keys(suite.tests).length;
          totalCount += suiteTestCount;
          return (
            <TestItem
              key={index.toString()}
              description={suiteName}
              value={suite.value}
              count={suiteTestCount}
              results={results[suiteName]?.results || []}
              onToggle={toggle}
            />
          );
        })}
      </ScrollView>
      <View style={styles.statsRow}>
        <View />
        <Text style={[styles.totalCount, { color: colors.text }]}>{totalCount}</Text>
      </View>
      <View style={styles.menu}>
        <Button title="Check All" onPress={checkAll} />
        <Button title="Clear All" onPress={clearAll} />
        <Button
          title="Run"
          onPress={() => {
            runTests(suites);
          }}
          color="green"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  testList: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "space-around",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  totalCount: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
