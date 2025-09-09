import { useState, useCallback } from 'react';
import type { TestSuites } from '@/types/tests';
import { TestsContext } from '@/tests/util';

import '../tests/account/account_tests';

export const useTestsList = (): [
  TestSuites,
  (description: string) => void,
  () => void,
  () => void,
] => {
  const [testSuites, setTestSuites] = useState<TestSuites>(TestsContext);

  const toggle = useCallback(
    (description: string) => {
      setTestSuites(suites => {
        suites[description]!.value = !suites[description]!.value;
        return suites;
      });
    },
    [setTestSuites],
  );

  const clearAll = useCallback(() => {
    setTestSuites(suites => {
      Object.values(suites).forEach(suite => {
        suite.value = false;
      });
      return { ...suites };
    });
  }, [setTestSuites]);

  const checkAll = useCallback(() => {
    setTestSuites(suites => {
      Object.values(suites).forEach(suite => {
        suite.value = true;
      });
      return { ...suites };
    });
  }, [setTestSuites]);

  return [testSuites, toggle, clearAll, checkAll];
};
