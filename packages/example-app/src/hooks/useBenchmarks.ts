import { useEffect, useState } from 'react';
import { BenchmarkSuite } from '../benchmarks/benchmarks';

export const useBenchmarks = (): [
  BenchmarkSuite[],
  (name: string) => void,
  () => void,
  () => void,
  () => void,
  () => void,
] => {
  const [suites, setSuites] = useState<BenchmarkSuite[]>([]);
  const [runCurrent, setRunCurrent] = useState<number>(-1);

  // initial load of benchmark suites
  useEffect(() => {
    const newSuites: BenchmarkSuite[] = [];
    setSuites(newSuites);
  }, []);

  // This jank is used to trick async functions into running synchronously
  // so we run one benchmark at a time and have dedicated resources instead of
  // conflicting with other benchmarks.
  useEffect(() => {
    if (runCurrent < 0) return; // not running benchmarks
    // reset to -1 if we're past the end
    if (runCurrent >= suites.length) {
      setRunCurrent(-1);
      return;
    }
    const s = suites[runCurrent];
    if (s?.enabled) {
      updateSuites(suite => {
        if (suite.name === s.name) {
          suite.state = 'running';
        }
      });
    } else {
      setRunCurrent(runCurrent + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runCurrent]);

  const updateSuites = (fn: (suite: BenchmarkSuite) => void) => {
    if (!suites.length) return;
    const copy = [...suites];
    copy.forEach(fn);
    setSuites(copy);
  };

  const toggle = (name: string) =>
    updateSuites(suite => {
      if (suite.name === name) {
        suite.enabled = !suite.enabled;
      }
    });

  const checkAll = () =>
    updateSuites(suite => {
      suite.enabled = true;
    });

  const clearAll = () =>
    updateSuites(suite => {
      suite.enabled = false;
    });

  const runBenchmarks = () => {
    setRunCurrent(0);
  };

  const bumpRunCurrent = () => {
    setRunCurrent(runCurrent + 1);
  };

  return [suites, toggle, checkAll, clearAll, runBenchmarks, bumpRunCurrent];
};
