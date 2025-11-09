import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { StoreInitializer } from "./src/components/StoreInitializer";
import AppNavigator from "./src/navigation/AppNavigator";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#020617",
    card: "#020617",
    border: "transparent",
    text: "#f8fafc",
    primary: "#26648E",
    notification: "#53D2DC",
  }
};

export default function App() {
  return (
    <GestureHandlerRootView className="flex-1 bg-slate-950">
      <SafeAreaProvider>
        <StoreInitializer>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
            <AppNavigator />
          </NavigationContainer>
        </StoreInitializer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
