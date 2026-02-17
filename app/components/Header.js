import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const MENU_ITEMS = [
  { id: "World Tournaments", label: "World Tournaments", type: "continent", continentKey: "World_Tournaments" },
  { id: "europe", label: "Europe", type: "continent", continentKey: "europe" },
  { id: "africa", label: "Africa", type: "continent", continentKey: "africa" },
  { id: "asia", label: "Asia", type: "continent", continentKey: "asia" },
  { id: "north-america", label: "North America", type: "continent", continentKey: "north-america" },
  { id: "south-america", label: "South America", type: "continent", continentKey: "south-america" },
  { id: "privacy", label: "Privacy Policy", type: "privacy" },
];

export default function Header({
  isOpen = false,
  setIsOpen = () => {},
  backButton = false,
  scrollRef,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const HEADER_HEIGHT = 60;
  const FOOTER_HEIGHT = 60;
  const screenHeight = Dimensions.get("window").height;

  const menuAnim = useRef(new Animated.Value(0)).current;
  const separatorAnim = useRef(new Animated.Value(0)).current;
  const itemAnimations = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(separatorAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (isOpen) {
      Animated.stagger(
        60,
        itemAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        )
      ).start();
    } else {
      itemAnimations.forEach(anim => anim.setValue(0));
    }
  }, [isOpen]);

  const menuHeight = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenHeight - HEADER_HEIGHT - insets.top - FOOTER_HEIGHT],
  });

  const overlayOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const separatorTranslate = separatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get("window").width, 0],
  });

  const handleLogoPress = () => {
    if (scrollRef?.current?.scrollToOffset) {
      scrollRef.current.scrollToOffset({ offset: 0, animated: true });
      return;
    }
    if (scrollRef?.current?.scrollTo) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
      return;
    }
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "ios" ? insets.top : 0,
            height: HEADER_HEIGHT + (Platform.OS === "ios" ? insets.top : 0),
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={handleLogoPress}>
          <Text style={styles.logo}>
            <Text style={styles.logoHighlight}>Live</Text>Score
          </Text>
        </TouchableOpacity>

        {backButton ? (
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.menuIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
            <Text style={styles.menuIcon}>{isOpen ? "✕" : "☰"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {!backButton && (
        <Animated.View
          style={[
            styles.menuOverlay,
            {
              height: menuHeight,
              top: HEADER_HEIGHT + (Platform.OS === "ios" ? insets.top : 0),
              shadowOpacity: overlayOpacity,
            },
          ]}
        >
          <Animated.View
            style={[styles.separator, { transform: [{ translateX: separatorTranslate }] }]}
          />

          <ScrollView contentContainerStyle={styles.menuContent}>
            {MENU_ITEMS.map((item, index) => {
              const anim = itemAnimations[index] || new Animated.Value(1);

              const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] });
              const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

              return (
                <Animated.View key={item.id} style={{ transform: [{ translateX }], opacity }}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.75}
                    onPress={() => {
                      setIsOpen(false);

                      if (item.type === "privacy") return navigation.navigate("PrivacyPolicy");
                      if (item.type === "matchStats") return navigation.navigate("MatchStats");
                      if (item.type === "continent")
                        return navigation.navigate("ContinentLeagues", {
                          continentKey: item.continentKey,
                          continentTitle: item.label,
                        });
                    }}
                  >
                    <View style={styles.dot} />
                    <Text style={styles.menuText}>{item.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { zIndex: 100 },
  header: {
    backgroundColor: "#001228",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  logo: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  logoHighlight: { color: "#fff" },
  menuIcon: { fontSize: 22, color: "#fff" },
  menuOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#001228",
    overflow: "hidden",
    elevation: 8,
  },
  separator: { height: 2, backgroundColor: "#ddd", width: "100%" },
  menuContent: { paddingVertical: 12 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ddd", marginRight: 12 },
  menuText: { fontSize: 13, fontWeight: "400", color: "#ddd" },
});