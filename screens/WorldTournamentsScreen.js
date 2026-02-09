import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";

const GITHUB_JSON_URL =
  "https://raw.githubusercontent.com/amerimohammed31/LiveScore/refs/heads/main/ApisLiveScore.json";

export default function WorldTournamentsScreen() {
  const route = useRoute();
  const { leagueKey, leagueTitle } = route.params;

  const [leagueInfo, setLeagueInfo] = useState({
    name: leagueTitle,
    logo: null,
  });
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const cellFlex = {
    rank: 0.6,
    team: 2.5,
    stat: 0.7,
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(GITHUB_JSON_URL);
        const data = await res.json();

        const league =
          data.LEAGUES?.[leagueKey] || { name: leagueTitle, logo: null };
        setLeagueInfo(league);

        if (data.CONFIG?.STANDINGS_URL) {
          const standingsRes = await fetch(
            `${data.CONFIG.STANDINGS_URL}/${leagueKey}`
          );
          const standingsData = await standingsRes.json();

          if (Array.isArray(standingsData)) {
            if (standingsData[0]?.rows) {
              setTables(
                standingsData.map((table, i) => ({
                  title: table.title || `Group ${String.fromCharCode(65 + i)}`,
                  rows: table.rows.map(team => ({
                    ...team,
                    logo: team.logo || league.logo,
                  })),
                }))
              );
            } else {
              setTables([
                {
                  title: null,
                  rows: standingsData.map(team => ({
                    ...team,
                    logo: team.logo || league.logo,
                  })),
                },
              ]);
            }
          } else {
            setTables([]);
          }
        }
      } catch {
        setTables([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [leagueKey, leagueTitle]);

  const renderRow = ({ item, index }) => {
    const backgroundColor =
      Math.floor(index / 4) % 2 === 0 ? "#f8f9fa" : "#ffffff";
    const marginBottom = 0;

    return (
      <View style={[styles.tableRow, { backgroundColor, marginBottom }]}>
        <Text style={[styles.cell, { flex: cellFlex.rank }]}>
          {item.rank}
        </Text>

        <View
          style={[
            styles.cell,
            {
              flex: cellFlex.team,
              flexDirection: "row",
              alignItems: "center",
            },
          ]}
        >
          {item.logo && (
            <Image source={{ uri: item.logo }} style={styles.logo} />
          )}
          <Text style={styles.teamName} numberOfLines={1}>
            {item.team}
          </Text>
        </View>

        <Text style={[styles.cell, { flex: cellFlex.stat }]}>{item.played}</Text>
        <Text style={[styles.cell, { flex: cellFlex.stat }]}>{item.wins}</Text>
        <Text style={[styles.cell, { flex: cellFlex.stat }]}>{item.draws}</Text>
        <Text style={[styles.cell, { flex: cellFlex.stat }]}>{item.losses}</Text>
        <Text style={[styles.cell, { flex: cellFlex.stat }]}>{item.goalsFor}</Text>
        <Text style={[styles.cell, { flex: cellFlex.stat }]}>{item.goalsAgainst}</Text>
        <Text style={[styles.cell, { flex: cellFlex.stat }]}>{item.goalDiff}</Text>
        <Text style={[styles.cell, { flex: cellFlex.stat }]}>{item.points}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#001228" />
        <Text style={styles.loadingText}>
          Loading {leagueInfo.name}...
        </Text>
      </View>
    );
  }

  if (!tables.length) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "red", fontWeight: "bold" }}>
          No data available for {leagueInfo.name}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Text style={styles.title}>{leagueInfo.name}</Text>

      {tables.map((table, tableIndex) => (
        <View key={tableIndex} style={{ marginBottom: 20 }}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: cellFlex.rank }]}>#</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.team }]}>Team</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.stat }]}>P</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.stat }]}>W</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.stat }]}>D</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.stat }]}>L</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.stat }]}>GF</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.stat }]}>GA</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.stat }]}>GD</Text>
              <Text style={[styles.headerCell, { flex: cellFlex.stat }]}>Pts</Text>
            </View>

            <FlatList
              data={table.rows}
              renderItem={renderRow}
              keyExtractor={(item, i) =>
                `${tableIndex}-${item.rank}-${item.team}-${i}`
              }
              scrollEnabled={false}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001228",
    textAlign: "center",
    marginBottom: 15,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#001228",
    textAlign: "center",
    marginBottom: 6,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#001228",
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    paddingVertical: 8,
  },
  headerCell: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 10,
    paddingHorizontal: 5,
  },
  cell: {
    color: "#001228",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 10,
    paddingHorizontal: 5,
  },
  teamName: {
    color: "#001228",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 10,
    flexShrink: 1,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 5,
    borderRadius: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#001228",
    fontWeight: "bold",
  },
});
