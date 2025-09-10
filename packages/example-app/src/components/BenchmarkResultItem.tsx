import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { calculateTimes, formatNumber } from "@/benchmarks/utils";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { BenchmarkResult } from "@/types/benchmarks";

type BenchmarkResultItemProps = {
  result: BenchmarkResult;
};

type Key = "throughput" | "latency";

export const BenchmarkResultItemHeader: React.FC = () => {
  const colors = useThemeColors();
  
  return (
    <View style={styles.itemContainer}>
      <Text style={[styles.text, styles.description, { color: colors.text }]}>&nbsp;</Text>
      <Text style={[styles.label, { color: colors.text }]}>times</Text>
      <Text style={[styles.label, { color: colors.text }]}>rnqc</Text>
      <Text style={[styles.label, { color: colors.text }]}>challenger</Text>
    </View>
  );
};

export const BenchmarkResultItem: React.FC<BenchmarkResultItemProps> = ({
  result,
}: BenchmarkResultItemProps) => {
  const colors = useThemeColors();
  const rows = ["throughput", "latency"].map((key) => {
    const us = result.us![key as Key].mean;
    const them = result.them![key as Key].mean;
    const comparison = key === "throughput" ? us > them : us < them;
    const places = key === "throughput" ? 2 : 3;
    const times = calculateTimes(us, them);
    const emoji = comparison ? "🐇" : "🐢";
    const timesType = comparison ? "faster" : "slower";
    const timesStyle = timesType === "faster" ? 
      [styles.faster, { color: colors.green }] : 
      [styles.slower, { color: colors.red }];

    return (
      <View key={key}>
        <View style={styles.itemContainer}>
          <Text style={[styles.text, { color: colors.text }]}>{emoji}</Text>
          <Text style={[styles.text, styles.description, { color: colors.text }]}>
            {key} {key === "throughput" ? "(ops/s)" : "(ms)"}
          </Text>
          <Text style={[styles.value, timesStyle]}>{formatNumber(times, 2, "x")}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{formatNumber(us, places, "")}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{formatNumber(them, places, "")}</Text>
        </View>
      </View>
    );
  });

  return (
    <View>
      <View style={styles.subContainer}>
        <Text style={[styles.sub, styles.benchName, { color: colors.text }]}>{result.benchName}</Text>
      </View>
      {rows}
      <View style={styles.subContainer}>
        <Text style={[styles.sub, styles.subLabel, { color: colors.text }]}>challenger</Text>
        <Text style={[styles.sub, styles.subValue, { color: colors.text }]}>{result.challenger}</Text>
      </View>
      {result.notes !== "" && (
        <View style={styles.subContainer}>
          <Text style={[styles.sub, styles.subLabel, { color: colors.text }]}>notes</Text>
          <Text style={[styles.sub, styles.subValue, { color: colors.text }]}>{result.notes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    padding: 4,
  },
  subContainer: {
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  text: {
    flexShrink: 1,
    paddingRight: 5,
    fontSize: 12,
  },
  description: {
    flex: 3,
    fontSize: 10,
    alignSelf: "flex-end",
  },
  value: {
    fontSize: 10,
    fontFamily: "Courier New",
    minWidth: 60,
    textAlign: "right",
    alignSelf: "flex-end",
  },
  label: {
    fontSize: 8,
    fontWeight: "bold",
    minWidth: 60,
    textAlign: "center",
  },
  faster: {
    fontWeight: "bold",
  },
  slower: {
    fontWeight: "bold",
  },
  sub: {
    fontSize: 8,
  },
  subLabel: {
    flex: 1,
    fontWeight: "bold",
    marginRight: 5,
  },
  subValue: {
    flex: 2,
  },
  benchName: {
    fontSize: 10,
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
  },
});
