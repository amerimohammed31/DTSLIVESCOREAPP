import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import MatchBox from "./components/MatchBox";

// ⭐ اضافة Context فقط
import { DataStatusContext } from "./context/DataStatusContext";

const GITHUB_JSON_URL =
  "https://raw.githubusercontent.com/amerimohammed31/LiveScore/refs/heads/main/ApisLiveScore.json";
const REFRESH_INTERVAL = 60 * 1000;

const normalizeLeague = (name) => {
  if (!name) return "Unknown";
  return name;
};

export default function MatchData({ navigation }) {
  const [allMatches, setAllMatches] = useState([]);
  const [matches, setMatches] = useState([]);
  const [league, setLeague] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [config, setConfig] = useState(null);

  // ⭐ استعمال Context (بدون تغيير اي شيء اخر)
  const { setMatchHasData } = useContext(DataStatusContext);

  const fetchMatches = async (apiUrl) => {
    if (!apiUrl) return;
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const normalized = [];

      data.forEach((leagueData) => {
        leagueData.matches.forEach((m) => {
          const statusMapped = mapStatus(m.status, m.isLive);
          const [homeScore, awayScore] = m.score
            ? m.score.split(" - ")
            : [m.goals?.home?.length || 0, m.goals?.away?.length || 0];

          normalized.push({
            id: `${normalizeLeague(leagueData.leagueName)}-${m.homeTeam.name}-${m.awayTeam.name}`,
            league: normalizeLeague(leagueData.leagueName),
            home_team: m.homeTeam.name,
            home_team_logo: m.homeTeam.logo,
            away_team: m.awayTeam.name,
            away_team_logo: m.awayTeam.logo,
            status: statusMapped,
            home_score: homeScore,
            away_score: awayScore,
            time: formatTime(m.time, statusMapped),
            rawTime: m.time,
            isLive: m.isLive,
            goals: m.goals,
            matchData: m,
          });
        });
      });

      const sorted = sortMatches(normalized);

      setAllMatches(sorted);

      // ⭐ اضافة احترافية فقط (بدون تغيير منطقك)
      setMatchHasData(sorted.length > 0);

      setLoading(false);
      setError(false);
    } catch {
      setError(true);
      setLoading(false);

      // ⭐ عند الخطأ نعتبر لا توجد بيانات
      setMatchHasData(false);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch(GITHUB_JSON_URL);
        const data = await res.json();
        setConfig(data.CONFIG);
        fetchMatches(data.CONFIG.API_BASE_URL);
      } catch {
        setError(true);
        setLoading(false);
        setMatchHasData(false);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (!config?.API_BASE_URL) return;
    const interval = setInterval(
      () => fetchMatches(config.API_BASE_URL),
      REFRESH_INTERVAL
    );
    return () => clearInterval(interval);
  }, [config]);

  useEffect(() => {
    let filtered = allMatches;
    if (league !== "ALL")
      filtered = filtered.filter((m) => m.league === league);
    if (statusFilter !== "ALL")
      filtered = filtered.filter((m) => m.status === statusFilter);
    setMatches(filtered);
  }, [league, statusFilter, allMatches]);

  const matchesByLeague =
    league === "ALL"
      ? allMatches
      : allMatches.filter((m) => m.league === league);

  const allStatusCount = matchesByLeague.length;
  const liveCount = matchesByLeague.filter((m) => m.status === "LIVE").length;
  const finishedCount = matchesByLeague.filter(
    (m) => m.status === "FINISHED"
  ).length;
  const upcomingCount = matchesByLeague.filter(
    (m) => m.status === "UPCOMING"
  ).length;

  const leagues = ["ALL", ...new Set(allMatches.map((m) => m.league))];

  const matchesByStatus = allMatches.filter(
    (m) => statusFilter === "ALL" || m.status === statusFilter
  );

  const leagueCounts = matchesByStatus.reduce((acc, m) => {
    acc[m.league] = (acc[m.league] || 0) + 1;
    return acc;
  }, {});

  const allLeagueCount = matchesByStatus.length;

  if (loading)
    return (
      <View style={styles.loaderWrapper}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#001228" />
        </View>
      </View>
    );

  if (error)
    return <View style={styles.emptyContainer}></View>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        horizontal
        data={[
          { label: `All (${allStatusCount})`, value: "ALL" },
          { label: `Live (${liveCount})`, value: "LIVE" },
          { label: `Finished (${finishedCount})`, value: "FINISHED" },
          { label: `Upcoming (${upcomingCount})`, value: "UPCOMING" },
        ]}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setStatusFilter(item.value)}
            style={[
              styles.statusFilterItem,
              statusFilter === item.value && styles.activeStatusFilter,
            ]}
          >
            <Text
              style={[
                styles.statusFilterText,
                statusFilter === item.value &&
                  styles.activeStatusFilterText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilter}
      />

      <FlatList
        horizontal
        data={leagues}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setLeague(item)}
            style={[
              styles.filterItem,
              league === item && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                league === item && styles.activeFilterText,
              ]}
            >
              {item === "ALL"
                ? `ALL (${allLeagueCount})`
                : `${item} (${leagueCounts[item] || 0})`}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.filter}
      />

      <FlatList
        data={matches}
        keyExtractor={(m, index) => `${m.id}-${index}`}
        renderItem={({ item }) => (
          <MatchBox
            navigation={navigation}
            team_left={item.home_team_logo}
            name_team_left={item.home_team}
            team_right={item.away_team_logo}
            name_team_right={item.away_team}
            status={item.status}
            home_score={item.home_score}
            away_score={item.away_score}
            time={item.isLive ? "LIVE" : item.time}
            info={item.league}
            goals={item.goals}
            matchData={item}
          />
        )}
        style={styles.container}
      />
    </View>
  );
}

function mapStatus(status, isLive) {
  if (isLive || (status && status.toLowerCase() === "live")) return "LIVE";
  if (status && status.toLowerCase() === "finished") return "FINISHED";
  return "UPCOMING";
}

function sortMatches(matches) {
  const order = { LIVE: 0, UPCOMING: 1, FINISHED: 2 };
  return [...matches].sort((a, b) => {
    if (order[a.status] !== order[b.status])
      return order[a.status] - order[b.status];
    return new Date(a.rawTime) - new Date(b.rawTime);
  });
}

function formatTime(text, status) {
  if (!text) return "";
  if (status === "LIVE") return text;
  try {
    const date = new Date(text);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  } catch {
    return text;
  }
}

const styles = StyleSheet.create({
  container: { padding: 5 },

  loaderWrapper: { flex: 1, paddingVertical: 20 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  filter: { paddingVertical: 8, paddingHorizontal: 6, backgroundColor: "#fff" },
  filterItem: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 6,
  },
  activeFilter: { backgroundColor: "#001228" },
  filterText: { fontSize: 11, color: "#001228" },
  activeFilterText: { color: "#fff" },

  statusFilter: { paddingVertical: 8, paddingHorizontal: 6, backgroundColor: "#f6f6f6" },
  statusFilterItem: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#ddd",
    marginRight: 6,
  },
  activeStatusFilter: { backgroundColor: "#001228" },
  statusFilterText: { fontSize: 11, color: "#001228" },
  activeStatusFilterText: { color: "#fff" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
