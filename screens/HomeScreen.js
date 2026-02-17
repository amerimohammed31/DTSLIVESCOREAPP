import React, { useContext } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import MatchData from "../app/MatchData";
import Ranking from "../app/components/Ranking";
import { DataStatusContext } from "../app/context/DataStatusContext";

export default function HomeScreen({ navigation }) {
  const { matchHasData, rankingHasData } =
    useContext(DataStatusContext);

  if (!matchHasData && !rankingHasData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Please check your connection.
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={[{ key: "content" }]}
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <>
            {matchHasData && <MatchData navigation={navigation} />}
            {rankingHasData && <Ranking />}
          </>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});