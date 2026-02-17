import React, { useEffect, useReducer, useRef, useContext, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import MatchBox from "./components/MatchBox";
import { DataStatusContext } from "./context/DataStatusContext";

const GITHUB_JSON_URL =
  "https://raw.githubusercontent.com/amerimohammed31/LiveScore/refs/heads/main/ApisLiveScore.json";

// -------------------- Helpers --------------------
const normalizeLeague = (name) => name || "Unknown";

const mapStatus = (status, isLive) => {
  const s = (status || "").toLowerCase();
  if (
    isLive ||
    s.includes("live") ||
    s.includes("1h") ||
    s.includes("2h") ||
    s.includes("ht") ||
    s.includes("half") ||
    s.includes("inplay")
  ) return "LIVE";
  if (s.includes("finished") || s.includes("ft") || s.includes("ended") || s.includes("full"))
    return "FINISHED";
  return "UPCOMING";
};

const parseLiveMinute = (time) => {
  if (!time) return 0;
  const m = time.match(/(\d+)'/);
  if (m) return parseInt(m[1], 10);
  if (time.toLowerCase().includes("ht")) return 45;
  return 0;
};

const parseTimeToNumber = (time) => {
  if (!time) return 0;
  const parts = time.split(":");
  if (parts.length !== 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
};

const extractTimeFromRawText = (rawText) => {
  if (!rawText) return "";
  const match = rawText.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : "";
};

const ultraSortMatches = (matches) => {
  const order = { LIVE: 0, UPCOMING: 1, FINISHED: 2 };
  return [...matches].sort((a, b) => {
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    if (a.status === "LIVE") return parseLiveMinute(b.time) - parseLiveMinute(a.time);
    if (a.status === "UPCOMING") return parseTimeToNumber(a.time) - parseTimeToNumber(b.time);
    return 0;
  });
};

const normalizeMatches = (data) => {
  const normalized = [];
  data.forEach((leagueData) => {
    leagueData.matches.forEach((m) => {
      const statusMapped = mapStatus(m.status, m.isLive);
      const matchTime = extractTimeFromRawText(m.rawText) || "";
      const [homeScore, awayScore] = m.score
        ? m.score.split(" - ")
        : [m.goals?.home?.length || 0, m.goals?.away?.length || 0];
      const matchId = `${normalizeLeague(leagueData.leagueName)}-${m.homeTeam.name}-${m.awayTeam.name}-${matchTime}`;

      if (!normalized.some((match) => match.id === matchId)) {
        normalized.push({
          id: matchId,
          league: normalizeLeague(leagueData.leagueName),
          home_team: m.homeTeam.name,
          home_team_logo: m.homeTeam.logo,
          away_team: m.awayTeam.name,
          away_team_logo: m.awayTeam.logo,
          status: statusMapped,
          home_score: homeScore,
          away_score: awayScore,
          time: matchTime,
          rawTime: matchTime,
          isLive: m.isLive,
          goals: m.goals,
          stats: m.stats || {},
          matchData: m,
        });
      }
    });
  });
  return ultraSortMatches(normalized);
};

// -------------------- Reducer --------------------
const initialState = {
  allMatches: [],
  filteredMatches: [],
  league: "ALL",
  statusFilter: "ALL",
  loading: true,
  error: false,
  config: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_CONFIG":
      return { ...state, config: action.payload };
    case "SET_MATCHES":
      return { ...state, allMatches: action.payload, loading: false, error: false };
    case "SET_ERROR":
      return { ...state, error: true, loading: false };
    case "SET_FILTER":
      return { ...state, [action.filter]: action.value };
    case "SET_FILTERED":
      return { ...state, filteredMatches: action.payload };
    default:
      return state;
  }
};

// -------------------- Main Component --------------------
export default function MatchData({ navigation }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { setMatchHasData } = useContext(DataStatusContext);
  const previousMatchesRef = useRef({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const autoRefreshIntervalRef = useRef(null);

  const updateMatchesState = (newMatches) => {
    const prev = previousMatchesRef.current;
    let hasChange = false;

    newMatches.forEach((match) => {
      const matchJson = JSON.stringify(match);
      if (!prev[match.id] || prev[match.id] !== matchJson) {
        prev[match.id] = matchJson;
        hasChange = true;
      }
    });

    if (hasChange || Object.keys(prev).length !== newMatches.length) {
      dispatch({ type: "SET_MATCHES", payload: newMatches });
      setMatchHasData(newMatches.length > 0);
    }
  };

  const fetchMatches = async (apiUrl) => {
    if (!apiUrl) return;
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const normalized = normalizeMatches(data);
      updateMatchesState(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      dispatch({ type: "SET_ERROR" });
      setMatchHasData(false);
    }
  };

  // -------------------- Load Config --------------------
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch(GITHUB_JSON_URL);
        const data = await res.json();
        dispatch({ type: "SET_CONFIG", payload: data.CONFIG });
        fetchMatches(data.CONFIG.API_BASE_URL);

        if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = setInterval(() => {
          fetchMatches(data.CONFIG.API_BASE_URL);
        }, 30000); // كل 30 ثانية
      } catch (err) {
        console.error("Config fetch error:", err);
        dispatch({ type: "SET_ERROR" });
        setMatchHasData(false);
      }
    };
    loadConfig();
    return () => clearInterval(autoRefreshIntervalRef.current);
  }, []);

  // -------------------- WebSocket with Safe Handling --------------------
  useEffect(() => {
    if (!state.config?.API_BASE_URL) return;

    const connectWS = () => {
      const wsUrl = state.config.API_BASE_URL.replace(/^http/, "ws");
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          let matchesData = [];
          if (Array.isArray(message)) {
            matchesData = message;
          } else if (message?.matches && Array.isArray(message.matches)) {
            matchesData = message.matches;
          } else if (message?.data?.matches && Array.isArray(message.data.matches)) {
            matchesData = message.data.matches;
          } else {
            console.warn("WebSocket message skipped: not an array", message);
            return;
          }

          const normalized = normalizeMatches(matchesData);
          updateMatchesState(normalized);
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      };

      wsRef.current.onerror = (err) => console.error("WebSocket error:", err);
      wsRef.current.onclose = () => {
        reconnectTimeoutRef.current = setTimeout(connectWS, 5000);
      };
    };

    connectWS();

    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [state.config]);

  // -------------------- Filter Matches --------------------
  useEffect(() => {
    let filtered = state.allMatches;
    if (state.league !== "ALL") filtered = filtered.filter((m) => m.league === state.league);
    if (state.statusFilter !== "ALL") filtered = filtered.filter((m) => m.status === state.statusFilter);
    dispatch({ type: "SET_FILTERED", payload: filtered });
  }, [state.allMatches, state.league, state.statusFilter]);

  // -------------------- Counts --------------------
  const matchesByLeague = state.league === "ALL" ? state.allMatches : state.allMatches.filter((m) => m.league === state.league);
  const allStatusCount = matchesByLeague.length;
  const liveCount = matchesByLeague.filter((m) => m.status === "LIVE").length;
  const finishedCount = matchesByLeague.filter((m) => m.status === "FINISHED").length;
  const upcomingCount = matchesByLeague.filter((m) => m.status === "UPCOMING").length;
  const leagues = ["ALL", ...new Set(state.allMatches.map((m) => m.league))];
  const matchesByStatus = state.allMatches.filter((m) => state.statusFilter === "ALL" || m.status === state.statusFilter);
  const leagueCounts = matchesByStatus.reduce((acc, m) => {
    acc[m.league] = (acc[m.league] || 0) + 1;
    return acc;
  }, {});
  const allLeagueCount = matchesByStatus.length;

  // -------------------- Render --------------------
  if (state.loading)
    return (
      <View style={styles.loaderWrapper}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#001228" />
        </View>
      </View>
    );

  if (state.error) return <View style={styles.emptyContainer}></View>;

  return (
    <View style={{ flex: 1 }}>
      {/* Status Filter */}
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
            onPress={() => dispatch({ type: "SET_FILTER", filter: "statusFilter", value: item.value })}
            style={[styles.statusFilterItem, state.statusFilter === item.value && styles.activeStatusFilter]}
          >
            <Text style={[styles.statusFilterText, state.statusFilter === item.value && styles.activeStatusFilterText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilter}
      />

      {/* League Filter */}
      <FlatList
        horizontal
        data={leagues}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => dispatch({ type: "SET_FILTER", filter: "league", value: item })}
            style={[styles.filterItem, state.league === item && styles.activeFilter]}
          >
            <Text style={[styles.filterText, state.league === item && styles.activeFilterText]}>
              {item === "ALL" ? `ALL (${allLeagueCount})` : `${item} (${leagueCounts[item] || 0})`}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.filter}
      />

      {/* Matches List */}
      <FlatList
        data={state.filteredMatches}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MemoizedMatchBox
            navigation={navigation}
            team_left={item.home_team_logo}
            name_team_left={item.home_team}
            team_right={item.away_team_logo}
            name_team_right={item.away_team}
            status={item.status}
            home_score={item.home_score}
            away_score={item.away_score}
            time={item.time}
            info={item.league}
            goals={item.goals}
            matchData={item}
          />
        )}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        windowSize={11}
        removeClippedSubviews={true}
        style={styles.container}
      />
    </View>
  );
}

// -------------------- Memoized MatchBox --------------------
const MemoizedMatchBox = memo(MatchBox);

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: { padding: 5 },
  loaderWrapper: { flex: 1, paddingVertical: 20 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  filter: { paddingVertical: 8, paddingHorizontal: 6, backgroundColor: "#fff" },
  filterItem: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#eee", marginRight: 6 },
  activeFilter: { backgroundColor: "#001228" },
  filterText: { fontSize: 11, color: "#001228" },
  activeFilterText: { color: "#fff" },
  statusFilter: { paddingVertical: 8, paddingHorizontal: 6, backgroundColor: "#f6f6f6" },
  statusFilterItem: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#ddd", marginRight: 6 },
  activeStatusFilter: { backgroundColor: "#001228" },
  statusFilterText: { fontSize: 11, color: "#001228" },
  activeStatusFilterText: { color: "#fff" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
