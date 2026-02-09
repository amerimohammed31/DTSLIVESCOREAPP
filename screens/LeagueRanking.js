import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";

const GITHUB_JSON_URL =
  "https://raw.githubusercontent.com/amerimohammed31/LiveScore/refs/heads/main/ApisLiveScore.json";

const QUALIFIED_COUNT = 4;
const RELEGATED_COUNT = 3;

export default function LeagueRanking() {
  const route = useRoute();
  const leagueKey = route?.params?.leagueKey || null;

  const [leagueInfo, setLeagueInfo] = useState({
    name: "League",
    logo: null,
    continent: null,
  });
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  const cellFlex = {
    rank: 0.6,
    team: 2.5,
    stat: 0.7,
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch(GITHUB_JSON_URL);
        const data = await res.json();

        const league = data.LEAGUES?.[leagueKey];
        if (!league) {
          setLoading(false);
          return;
        }

        if (league.continent === "World_Tournaments") {
          setLeagueInfo(league);
          setBlocked(true);
          setLoading(false);
          return;
        }

        setLeagueInfo(league);
        fetchStandings(leagueKey, data.CONFIG.STANDINGS_URL, league.logo);
      } catch {
        setLoading(false);
      }
    };

    loadConfig();
  }, [leagueKey]);

  const fetchStandings = async (key, standingsUrl, defaultLogo) => {
    if (!key || !standingsUrl) return;

    setLoading(true);
    try {
      const res = await fetch(`${standingsUrl}/${key}`);
      const data = await res.json();

      if (Array.isArray(data) && data[0]?.rows) {
        setTables(
          data.map((table, i) => ({
            title: table.title || `Group ${String.fromCharCode(65 + i)}`,
            rows: table.rows.map(team => ({
              ...team,
              logo: team.logo || defaultLogo,
            })),
          }))
        );
      } else if (Array.isArray(data)) {
        setTables([
          {
            title: null,
            rows: data.map(team => ({
              ...team,
              logo: team.logo || defaultLogo,
            })),
          },
        ]);
      } else {
        setTables([]);
      }
    } catch {
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const renderRow = (rowsLength) => ({ item, index }) => {
    const isQualified = index < QUALIFIED_COUNT;
    const isRelegated = index >= rowsLength - RELEGATED_COUNT;

    let backgroundColor =
      Math.floor(index / 4) % 2 === 0 ? "#f8f9fa" : "#ffffff";

    if (isQualified) backgroundColor = "#e7f1ff";
    if (isRelegated) backgroundColor = "#fdecea";

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
        <Text style={styles.loadingText}>Loading standings...</Text>
      </View>
    );
  }

  if (blocked) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.blockedText}>
          This screen is only for local leagues
        </Text>
      </View>
    );
  }

  if (!tables.length) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "red", fontWeight: "bold" }}>
          No standings data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Text style={styles.title}>{leagueInfo.name} Ranking</Text>

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
              renderItem={renderRow(table.rows.length)}
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
    fontSize: 14,
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
  },
  cell: {
    color: "#001228",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 10,
  },
  teamName: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "bold",
    flexShrink: 1,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 5,
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
  blockedText: {
    color: "#001228",
    fontWeight: "bold",
    fontSize: 14,
  },
});
