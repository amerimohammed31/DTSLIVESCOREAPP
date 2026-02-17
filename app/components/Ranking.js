import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DataStatusContext } from "../context/DataStatusContext";

const CONFIG_URL =
  "https://raw.githubusercontent.com/amerimohammed31/LiveScore/refs/heads/main/ApisLiveScore.json";

export default function Ranking({ navigation: propNavigation }) {
  const hookNavigation = useNavigation();
  const navigation = propNavigation || hookNavigation;

  const [continents, setContinents] = useState([]);

  const { setRankingHasData } = useContext(DataStatusContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(CONFIG_URL);
        const data = await response.json();
        const list = data.CONTINENTS || [];
        setContinents(list);

        setRankingHasData(list.length > 0);
      } catch (e) {
        setRankingHasData(false);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.club}
      onPress={() =>
        navigation.navigate("ContinentLeagues", {
          continentKey: item.key,
          continentTitle: item.title,
        })
      }
    >
      <Image source={{ uri: item.logo }} style={styles.logo} />
      <Text style={styles.name}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={continents}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
  },
  club: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#001228",
    borderRadius: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
    resizeMode: "contain",
  },
  name: {
    fontSize: 15,
    color: "#eee",
    fontWeight: "bold",
  },
});