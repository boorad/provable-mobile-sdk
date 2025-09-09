import type React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TestSuitesScreen } from '@/screens/TestSuitesScreen';
import { TestDetailsScreen } from '@/screens/TestDetailsScreen';
import { ThemeToggle } from '@/components/ThemeToggle';

const Stack = createNativeStackNavigator();

// Define header component outside render to avoid recreation
const HeaderRightComponent = () => <ThemeToggle />;

export const TestStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TestSuites"
        component={TestSuitesScreen}
        options={{ 
          title: 'Test Suites',
          headerRight: HeaderRightComponent
        }}
      />
      <Stack.Screen
        name="TestDetailsScreen"
        component={TestDetailsScreen}
        options={{ title: 'Test Details' }}
      />
    </Stack.Navigator>
  );
};
