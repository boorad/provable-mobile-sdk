import { LogBox } from "react-native";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Root } from "./navigators/Root";

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}

LogBox.ignoreLogs(["Open debugger to view warnings"]);
