import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2006-2026 All Rights Reserved. ®LiveScore®</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    height: 50,
    backgroundColor: "#001228",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontSize: 10 },
});
