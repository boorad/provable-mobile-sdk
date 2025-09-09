import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BenchmarkDetailsScreen } from "@/screens/BenchmarkDetailsScreen";
import { BenchmarkSuitesScreen } from "@/screens/BenchmarkSuitesScreen";

const Stack = createNativeStackNavigator();

// Define header component outside render to avoid recreation
const HeaderRightComponent = () => <ThemeToggle />;

export const BenchmarkStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BenchmarkSuites"
        component={BenchmarkSuitesScreen}
        options={{
          title: "Benchmark Suites",
          headerRight: HeaderRightComponent,
        }}
      />
      <Stack.Screen
        name="BenchmarkDetailsScreen"
        component={BenchmarkDetailsScreen}
        options={{ title: "Benchmark Details" }}
      />
    </Stack.Navigator>
  );
};
