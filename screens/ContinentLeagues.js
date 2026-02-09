import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const GITHUB_JSON_URL =
  "https://raw.githubusercontent.com/amerimohammed31/LiveScore/refs/heads/main/ApisLiveScore.json";

export default function ContinentLeagues() {
  const route = useRoute();
  const navigation = useNavigation();
  const { continentKey, continentTitle } = route.params;

  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch(GITHUB_JSON_URL);
        if (!res.ok) throw new Error("Failed to fetch GitHub config");
        const data = await res.json();
        setConfigData(data);

        const continentLeagues = Object.values(data.LEAGUES).filter(
          (league) => league.continent === continentKey
        );
        setLeagues(continentLeagues);
      } catch {
        Alert.alert("Error", "Failed to load leagues.");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [continentKey]);

  const handlePress = (league) => {
    if (!configData) return;

    if (league.continent === "World_Tournaments") {
      navigation.navigate("WorldTournamentsScreen", {
        leagueKey: league.key,
        leagueTitle: league.name,
      });
    } else {
      navigation.navigate("LeagueRanking", {
        leagueKey: league.key,
        leagueTitle: league.name,
      });
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
      <View style={{ flex: 1 }}>
        <Text style={styles.leagueTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.leagueKey}>{item.key.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#001228" />
        </View>
      )}

      <FlatList
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>{continentTitle} Leagues</Text>
          </View>
        }
        data={leagues}
        keyExtractor={(item, index) => `${item.key}-${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5", padding: 8 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  header: { fontSize: 16, fontWeight: "700", color: "#001228" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#001228",
    borderRadius: 6,
    marginBottom: 10,
    padding: 15,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  logo: { width: 40, height: 25, marginRight: 15, borderRadius: 4 },
  leagueTitle: { fontSize: 13, fontWeight: "700", color: "#fff" },
  leagueKey: { fontSize: 10, color: "#ccc" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
