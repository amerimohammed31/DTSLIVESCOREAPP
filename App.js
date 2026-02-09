import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import MainLayout from "./app/layouts/MainLayout";
import AppNavigator from "./AppNavigator";

// ⭐ استيراد Context
import { DataStatusProvider } from "./app/context/DataStatusContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <DataStatusProvider>
        <NavigationContainer>
          <MainLayout>
            <AppNavigator />
          </MainLayout>
        </NavigationContainer>
      </DataStatusProvider>
    </SafeAreaProvider>
  );
}
