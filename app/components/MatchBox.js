import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Pressable,
  FlatList,
} from "react-native";

const defaultIcon = require("../../assets/images/icon.png");

const LEAGUE_NAME_MAP = {};

const getImageSource = (img) => {
  if (!img) return defaultIcon;
  if (typeof img === "number") return img;
  if (typeof img === "string") return { uri: img };
  if (typeof img === "object" && img.src) return img.src;
  return defaultIcon;
};

export default function MatchBox({
  navigation,
  team_left,
  name_team_left,
  team_right,
  name_team_right,
  status,
  home_score,
  away_score,
  time,
  info,
  goals,
  matchData,
  leagueLogo,
  leagueName,
  homeTeam,
  awayTeam,
  showDetails = false,
  alwaysOpen = false,
}) {
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);

  const animation = useRef(new Animated.Value(0)).current;
  const goalAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const LIVE_STATUSES = ["LIVE", "IN_PLAY", "PAUSED", "BREAK", "HT", "INTERRUPTED", "1H", "2H"];
  const isLive = LIVE_STATUSES.includes(status);
  const isFinished = status === "FINISHED";
  const canShowStats = isLive || isFinished;

  const middleText = isLive || isFinished
    ? `${home_score ?? "-"} - ${away_score ?? "-"}`
    : time;

  const leagueDisplayName = LEAGUE_NAME_MAP[info] || info || leagueName;

  const stats = {
    Goals: { home: home_score ?? 0, away: away_score ?? 0 },
    Possession: { home: homeTeam?.stats?.possession ?? "-", away: awayTeam?.stats?.possession ?? "-" },
    Shots: { home: homeTeam?.stats?.shots ?? "-", away: awayTeam?.stats?.shots ?? "-" },
    "Shots on Target": { home: homeTeam?.stats?.shotsOnTarget ?? "-", away: awayTeam?.stats?.shotsOnTarget ?? "-" },
    Fouls: { home: homeTeam?.stats?.fouls ?? "-", away: awayTeam?.stats?.fouls ?? "-" },
    Corners: { home: homeTeam?.stats?.corners ?? "-", away: awayTeam?.stats?.corners ?? "-" },
  };

  const getGoalColor = (side) => {
    if (home_score == null || away_score == null) return "#000";
    if (side === "home" && home_score > away_score) return "#0e8b00";
    if (side === "away" && away_score > home_score) return "#0e8b00";
    return "#000";
  };

  const toggleStats = () => {
    if (alwaysOpen) return;
    const toValue = showStats ? 0 : 1;
    setShowStats(!showStats);
    Animated.spring(animation, {
      toValue,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const handleLongPress = () => {
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(pressAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate("MatchStatsScreen", {
        selectedMatch: {
          team_left,
          name_team_left,
          team_right,
          name_team_right,
          status,
          home_score,
          away_score,
          time,
          info,
          goals,
          matchData,
        }
      });
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLive || isFinished) {
      Animated.sequence([
        Animated.timing(goalAnim, { toValue: 1.35, duration: 150, useNativeDriver: true }),
        Animated.timing(goalAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [home_score, away_score]);

  useEffect(() => {
    if (alwaysOpen) {
      setShowStats(true);
      animation.setValue(1);
    }
  }, [alwaysOpen]);

  const statsTranslate = animation.interpolate({ inputRange: [0, 1], outputRange: [-25, 0] });
  const statsOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const statsScale = animation.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

  if (loading) {
    return (
      <View style={[styles.matchBoxContainer, { justifyContent: "center", alignItems: "center", height: 80 }]}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  const renderPlayer = ({ item }) => (
    <View style={styles.playerRow}>
      <Image source={{ uri: item.photo }} style={styles.playerPhoto} />
      <Text style={styles.playerNumber}>{item.number}</Text>
      <Text style={styles.playerName}>{item.name}</Text>
    </View>
  );

  const renderTeam = (team, teamLogo) => (
    <View style={styles.teamContainer}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        {/* شعار الفريق */}
        <Image source={getImageSource(teamLogo)} style={styles.teamLogoSmall} />

        <View style={{ marginLeft: 8 }}>
          {/* اسم الفريق وخطته */}
          <Text style={styles.teamName}>{team.name} ({team.formation})</Text>
          {/* اسم المدرب */}
        </View>
      </View>

      {/* قائمة اللاعبين */}
      <FlatList
        data={team.players}
        renderItem={renderPlayer}
        keyExtractor={(item) => `${item.number}-${item.name}`}
        scrollEnabled={false}
      />
    </View>
  );

  const renderStatRow = (label, homeValue, awayValue) => {
    const total = (typeof homeValue === "number" && typeof awayValue === "number") 
      ? homeValue + awayValue 
      : 100;
    const homeWidth = total > 0 && typeof homeValue === "number" ? `${(homeValue / total) * 100}%` : "50%";
    const awayWidth = total > 0 && typeof awayValue === "number" ? `${(awayValue / total) * 100}%` : "50%";

    return (
      <View style={{ marginBottom: 10 }}>
        <Text style={{ textAlign: "center", fontWeight: "bold", color: "#ddd" }}>{label}</Text>
        <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
          <View style={{ width: homeWidth, backgroundColor: "#004dc0" }} />
          <View style={{ width: awayWidth, backgroundColor: "#757575" }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ fontWeight: "bold", color: "#fff" }}>{homeValue}</Text>
          <Text style={{ fontWeight: "bold", color: "#fff" }}>{awayValue}</Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
      <View
        style={[styles.matchBoxContainer, isLive && styles.liveBox, isFinished && styles.finishedBox]}
      >
        <Pressable
          style={styles.matchRow}
          onPress={toggleStats}
          delayLongPress={5000}
          onLongPress={handleLongPress}
        >
          <View style={styles.teamBox}>
            <Image source={getImageSource(team_left)} style={styles.logo} />
            <Text style={styles.teamName} numberOfLines={1}>{name_team_left}</Text>
          </View>

          <View style={styles.middleBox}>
            {isLive && <Text style={styles.live}>LIVE</Text>}
            {isFinished && <Text style={styles.finished}>FINISHED</Text>}
            <Text style={styles.score}>{middleText}</Text>
            <Text style={styles.info}>{leagueDisplayName}</Text>
          </View>

          <View style={styles.teamBox}>
            <Image source={getImageSource(team_right)} style={styles.logo} />
            <Text style={styles.teamName} numberOfLines={1}>{name_team_right}</Text>
          </View>
        </Pressable>

        {showStats && canShowStats && (
          <Animated.View
            style={[styles.statsCard, { transform: [{ translateY: statsTranslate }, { scale: statsScale }], opacity: statsOpacity }]}
          >
            {/* أهداف */}
            <Text style={styles.statsTitle}>Goal Scorers</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
              <View style={{ width: "48%" }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 10 }}>{name_team_left}</Text>
                {goals?.home?.length > 0 ? goals.home.map((g, idx) => (
                  <Text key={idx} style={{ color: "#ddd", fontSize: 10 }}>{g.player} ({g.minute}')</Text>
                )) : <Text style={{ color: "#888", fontSize: 10 }}></Text>}
              </View>
              <View style={{ width: "48%", alignItems: "flex-end" }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 10 }}>{name_team_right}</Text>
                {goals?.away?.length > 0 ? goals.away.map((g, idx) => (
                  <Text key={idx} style={{ color: "#ddd", fontSize: 10 }}>{g.player} ({g.minute}')</Text>
                )) : <Text style={{ color: "#888", fontSize: 10 }}></Text>}
              </View>
            </View>

            {(showDetails || alwaysOpen) && (
              <View style={{ marginTop: 12 }}>
                {renderStatRow("Possession (%)", homeTeam.stats.possession, awayTeam.stats.possession)}
                {renderStatRow("Shots", homeTeam.stats.shots, awayTeam.stats.shots)}
                {renderStatRow("Shots on Target", homeTeam.stats.shotsOnTarget, awayTeam.stats.shotsOnTarget)}
                {renderStatRow("Fouls", homeTeam.stats.fouls, awayTeam.stats.fouls)}
                {renderStatRow("Corners", homeTeam.stats.corners, awayTeam.stats.corners)}

                {renderTeam(homeTeam, team_left)}
                {renderTeam(awayTeam, team_right)}
              </View>
            )}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  matchBoxContainer: { width: "100%", backgroundColor: "#001228", borderRadius: 6, marginVertical: 4, overflow: "hidden" },
  liveBox: { borderLeftWidth: 2, borderRightWidth: 2, borderLeftColor: "#0e8b00", borderRightColor: "#0e8b00" },
  finishedBox: { borderLeftWidth: 2, borderRightWidth: 2, borderLeftColor: "#ff2d2d", borderRightColor: "#ff2d2d", opacity: 0.95 },
  matchRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10 },
  teamBox: { width: 70, alignItems: "center", paddingVertical: 10 },
  logo: { width: 30, height: 30, marginBottom: 4 },
  teamName: { color: "#fff", fontSize: 10, fontWeight: "bold", textAlign: "center" },
  middleBox: { flex: 1, alignItems: "center" },
  live: { color: "#1aff00", fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  finished: { color: "#ff2d2d", fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  score: { color: "#fff", fontSize: 14, fontWeight: "bold", marginVertical: 2 },
  info: { color: "#ddd", fontSize: 11 },
  statsCard: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderColor: "#333" },
  statsTitle: { fontWeight: "bold", marginBottom: 6, fontSize: 12, textAlign: "center", color: "#ddd" },
  playerRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: "#444" },
  playerPhoto: { width: 30, height: 30, borderRadius: 15, marginRight: 6 },
  playerNumber: { width: 25, fontWeight: "400", textAlign: "center", color: "#fff" },
  playerName: { fontWeight: "400", color: "#fff" },
  teamContainer: { marginBottom: 12, borderWidth: 1, borderColor: "#333", borderRadius: 2, padding: 6 },
  coachName: { fontSize: 10, color: "#ddd", marginTop: 4, textAlign: "center", fontStyle: "italic" },
  teamLogoSmall: { width: 25, height: 25, borderRadius: 15 },
});
