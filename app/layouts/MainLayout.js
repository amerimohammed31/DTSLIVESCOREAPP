import React, { useState } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout({ children, backButton = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <Header backButton={backButton} isOpen={isOpen} setIsOpen={setIsOpen} />
      <View style={styles.content}>{children}</View>
      <View style={{ paddingBottom: insets.bottom }}>
        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
});
