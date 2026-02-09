import React, { useState } from "react"; 
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PrivacyPolicy() {
  const sectionsData = [
    {
      key: "intro",
      title: "Introduction",
      icon: "📄",
      content: "At LiveScore, we take your privacy seriously. This privacy policy explains how LiveScore collects, uses, and protects your information while using the app, especially regarding personalized ads provided through Google AdMob.",
    },
    {
      key: "collect",
      title: "Information We Collect",
      icon: "📄",
      content: "LiveScore may collect device information, app usage data, and sometimes information through Google AdMob and Firebase Analytics for analytics and advertising purposes.",
    },
    {
      key: "use",
      title: "How We Use Information",
      icon: "⚙️",
      content: "The collected information is used by LiveScore to improve the app experience, show personalized ads, and analyze app performance.",
    },
    {
      key: "sharing",
      title: "Sharing Information",
      icon: "🔗",
      content: "Data may be shared with Google AdMob and third-party services for advertising and analytics purposes by LiveScore.",
    },
    {
      key: "rights",
      title: "User Rights",
      icon: "🛡️",
      content: "You can control ad preferences via your Google account or request to delete your data by contacting LiveScore at LiveScore@LiveScore.com.",
    },
    {
      key: "children",
      title: "Children",
      icon: "👶",
      content: "This LiveScore app is not intended for children under 13 years old. LiveScore does not knowingly collect personal information from children.",
    },
    {
      key: "changes",
      title: "Changes to Privacy Policy",
      icon: "📝",
      content: "LiveScore may update this policy from time to time. Users will be notified of changes via the app.",
    },
    {
      key: "contact",
      title: "Contact Us",
      icon: "✉️",
      content: "If you have any questions about this privacy policy, please contact LiveScore at: LiveScore@LiveScore.com",
    },
  ];

  const [expanded, setExpanded] = useState({});

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>LiveScore Privacy Policy</Text>

      {sectionsData.map((section) => (
        <View key={section.key} style={styles.section}>
          <TouchableOpacity onPress={() => toggleSection(section.key)} activeOpacity={0.8} style={styles.header}>
            <Text style={styles.sectionTitle}>{section.icon} {section.title}</Text>
            <Text style={styles.toggleIcon}>{expanded[section.key] ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded[section.key] && (
            <View style={styles.content}>
              <Text style={styles.text}>{section.content}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001228",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#e6f0ff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001228",
  },
  toggleIcon: {
    fontSize: 12,
    fontWeight: "700",
    color: "#001228",
  },
  content: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  text: {
    fontSize: 10,
    lineHeight: 24,
    color: "#333",
  },
});
