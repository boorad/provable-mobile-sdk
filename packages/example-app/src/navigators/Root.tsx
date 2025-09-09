import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import type React from "react";
import { enableFreeze } from "react-native-screens";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { BenchmarkStack } from "@/navigators/BenchmarkStack";
import { TestStack } from "@/navigators/TestStack";

enableFreeze(true);
const Tab = createBottomTabNavigator();

// Define icon components outside of render
const TestIcon: React.FC<{ color: string }> = ({ color }) => (
  <MaterialDesignIcons name="test-tube" size={24} color={color} />
);

const BenchmarkIcon: React.FC<{ color: string }> = ({ color }) => (
  <MaterialDesignIcons name="timer" size={24} color={color} />
);

export const Root: React.FC = () => {
  const { isDark } = useTheme();
  const colors = useThemeColors();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.tabBarBackground,
      text: colors.text,
      border: colors.border,
      primary: colors.tabBarActive,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName="Tests"
        screenOptions={{
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.border,
          },
        }}
      >
        <Tab.Screen
          name="Tests"
          component={TestStack}
          options={{
            headerShown: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({ color }) => <TestIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="Benchmarks"
          component={BenchmarkStack}
          options={{
            headerShown: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({ color }) => <BenchmarkIcon color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
