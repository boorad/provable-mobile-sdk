import { FlatList, StyleSheet, Text, View } from "react-native";
import { BenchmarkItem } from "@/components/BenchmarkItem";
import { Button } from "@/components/Button";
import { useBenchmarks } from "@/hooks/useBenchmarks";
import { useThemeColors } from "@/hooks/useThemeColors";

export const BenchmarkSuitesScreen = () => {
  const [suites, toggle, checkAll, clearAll, runBenchmarks, bumpRunCurrent] = useBenchmarks();
  const colors = useThemeColors();

  let totalCount = 0;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <FlatList
        style={styles.benchmarkList}
        data={suites}
        renderItem={({ item, index }) => {
          const suiteBenchmarkCount = item.benchmarks.length;
          totalCount += suiteBenchmarkCount;
          return (
            <BenchmarkItem
              key={index.toString()}
              suite={item}
              toggle={() => toggle(item.name)}
              bumpRunCurrent={bumpRunCurrent}
            />
          );
        }}
      />
      <View style={styles.statsRow}>
        <View />
        <Text style={[styles.totalCount, { color: colors.text }]}>{totalCount}</Text>
      </View>
      <View style={styles.menu}>
        <Button title="Check All" onPress={checkAll} />
        <Button title="Clear All" onPress={clearAll} />
        <Button title="Run" onPress={runBenchmarks} color="green" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  benchmarkList: {
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
  totalCount: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
