import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
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

const LIVE_STATUSES = [
  "LIVE",
  "IN_PLAY",
  "PAUSED",
  "BREAK",
  "HT",
  "INTERRUPTED",
  "1H",
  "2H",
];

const FOOTBALL_LABELS_EN = {
  "Face à face": "Head-to-head",
  "Historique des confrontations": "Historical confrontations",
  "Dernières confrontations": "Last meetings",
  "Toutes compétitions": "All competitions",
  "Victoires": "Wins",
  "Nuls": "Draws",
  "Défaites": "Losses",
  "terminé": "Finished",
  "Stats des buts": "Goals stats",
  "Répartition des buts": "Goals distribution",
  "Buts par match": "Goals per match",
  "Aucun but marqué": "No goal scored",
  "Au moins 1 but marqué": "At least 1 goal scored",
  "Plus de 1.5 buts marqués": "Over 1.5 goals",
  "Plus de 2.5 buts marqués": "Over 2.5 goals",
  "Plus de 3.5 buts marqués": "Over 3.5 goals",
  "Plus de 4.5 buts marqués": "Over 4.5 goals",
  "Série en cours": "Current streak",
  "Résultats": "Results",
  "Les 2 effectifs": "Both squads",
  "Joueur": "Player",
  "Équipe": "Team",
  "Sélection": "National team",
  "MJ": "Matches played",
  "Min.": "Minutes",
  "Buts": "Goals",
  "P.D.": "Assists",
  "I.R.": "Rating index",
  "T.R.": "Total rating",
  "Âge moyen": "Avg age",
  "Taille moyenne": "Avg height",
  "Poids moyen": "Avg weight",
  "Top joueurs du tournoi": "Top tournament players",
  "Buteurs": "Goal scorers",
  "Passes Décisives": "Assists",
  "Voir le classement complet": "See full ranking",
  "Stats globales en championnat": "Overall championship stats",
  "Matchs": "Matches",
  "Buts sur penalty": "Penalty goals",
  "Possession": "Possession",
  "Précision des passes": "Pass accuracy",
  "Précision des centres": "Cross accuracy",
  "Premier but marqué en moyenne": "First goal on average",
  "Dernier but marqué en moyenne": "Last goal on average",
  "Premier but encaissé en moyenne": "First goal conceded on average",
  "Dernier but encaissé en moyenne": "Last goal conceded on average",
  "De l'intérieur de la surface": "Inside the box",
  "Du pied gauche": "Left foot",
  "Du pied droit": "Right foot",
  "De la tête": "Header",
  "Sur penalty": "Penalty",
  "De l'extérieur de la surface": "Outside the box",
  "Sur coup franc direct": "Direct free kick",
  "CSC provoqués": "Own goal",
  "Attaque": "Attack",
  "Tirs": "Shots",
  "Non cadrés": "Off-target",
  "Cadrés": "On-target",
  "Grosses occasions créées": "Big chances created",
  "Tirs bloqués": "Blocked shots",
  "Hors-jeux": "Offsides",
  "Touches": "Touches",
  "Dribbles réussis": "Successful dribbles",
  "Fautes subies": "Fouls suffered",
  "Ballons touchés": "Ball touches",
  "Dépossédé du ballon": "Dispossessed",
  "Circulation du ballon": "Ball circulation",
  "Corners et centres réussis": "Successful corners and crosses",
  "Corners joués": "Corners played",
  "Défense": "Defense",
  "Duels gagnés": "Duels won",
  "Duels aériens gagnés": "Aerial duels won",
  "Tacles réussis": "Successful tackles",
  "Dégagements": "Clearances",
  "Penalties concédés": "Penalties conceded",
  "Interceptions réussies": "Successful interceptions",
  "Gardien": "Goalkeeper",
  "Arrêts": "Saves",
};

const getImageSource = (img) => {
  if (!img) return defaultIcon;
  if (typeof img === "number") return img;
  if (typeof img === "string") return { uri: img };
  if (typeof img === "object" && img.src) return img.src;
  return defaultIcon;
};

function MatchBox({
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
  leagueName,
  homeTeam = {},
  awayTeam = {},
  showDetails = false,
  alwaysOpen = false,
}) {
  const [showStats, setShowStats] = useState(alwaysOpen);
  const [loading, setLoading] = useState(true);

  const animation = useRef(new Animated.Value(alwaysOpen ? 1 : 0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const isLive = useMemo(() => LIVE_STATUSES.includes(status), [status]);
  const isFinished = useMemo(() => status === "FINISHED", [status]);

  const middleText = useMemo(
    () => (isLive || isFinished ? `${home_score ?? "-"} - ${away_score ?? "-"}` : time),
    [home_score, away_score, isLive, isFinished, time]
  );

  const leagueDisplayName = useMemo(
    () => LEAGUE_NAME_MAP[info] || info || leagueName,
    [info, leagueName]
  );

  const stats = useMemo(() => ({ Goals: { home: home_score ?? 0, away: away_score ?? 0 } }), [home_score, away_score]);

  const goalStats = useMemo(() => matchData?.stats?.goalStats || [], [matchData]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 80);
    return () => clearTimeout(timer);
  }, []);

  const toggleStats = useCallback(() => {
    if (alwaysOpen) return;
    const toValue = showStats ? 0 : 1;
    setShowStats(!showStats);
    Animated.spring(animation, {
      toValue,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [animation, showStats, alwaysOpen]);

  const handleLongPress = useCallback(() => {
    const { navigation: nav, ...safeMatch } = { navigation, team_left, team_right, name_team_left, name_team_right, status, home_score, away_score, time, info, goals, matchData, leagueName, homeTeam, awayTeam, showDetails, alwaysOpen };
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 1.05, duration: 120, useNativeDriver: true }),
      Animated.timing(pressAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate("MatchStatsScreen", { selectedMatch: safeMatch });
    });
  }, [navigation, pressAnim, team_left, team_right, name_team_left, name_team_right, status, home_score, away_score, time, info, goals, matchData, leagueName, homeTeam, awayTeam, showDetails, alwaysOpen]);

  const statsTranslate = animation.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const statsOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const renderPlayer = useCallback(({ item }) => (
    <View style={styles.playerRow}>
      <Image source={{ uri: item.photo }} style={styles.playerPhoto} />
      <Text style={styles.playerNumber}>{item.number}</Text>
      <Text style={styles.playerName}>{item.name}</Text>
    </View>
  ), []);

  const renderTeam = useCallback((team, teamLogo, sideKey) => (
    <View key={`team-${sideKey}`} style={styles.teamContainer}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <Image source={getImageSource(teamLogo)} style={styles.teamLogoSmall} />
        <Text style={[styles.teamName, { marginLeft: 8 }]}>{team?.name} ({team?.formation})</Text>
      </View>
      <FlatList
        data={team?.players || []}
        renderItem={renderPlayer}
        keyExtractor={(item, i) => `player-${i}-${item.number}-${item.name}`}
        scrollEnabled={false}
      />
    </View>
  ), [renderPlayer]);

  const renderStatRow = useCallback((label, homeValue, awayValue, index = 0) => {
    const total = typeof homeValue === "number" && typeof awayValue === "number" ? homeValue + awayValue : 100;
    const homeWidth = total > 0 && typeof homeValue === "number" ? `${(homeValue / total) * 100}%` : "50%";
    const awayWidth = total > 0 && typeof awayValue === "number" ? `${(awayValue / total) * 100}%` : "50%";

    return (
      <View key={`stat-${label}-${index}`} style={{ marginBottom: 10 }}>
        <Text style={{ textAlign: "center", fontWeight: "500", color: "#ddd" }}>{label}</Text>
        <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
          <View style={{ width: homeWidth, backgroundColor: "#004dc0" }} />
          <View style={{ width: awayWidth, backgroundColor: "#cecece" }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ fontWeight: "bold", color: "#fff" }}>{homeValue}</Text>
          <Text style={{ fontWeight: "bold", color: "#fff" }}>{awayValue}</Text>
        </View>
      </View>
    );
  }, []);

  if (loading) return <View style={[styles.matchBoxContainer, { height: 80, justifyContent: "center", alignItems: "center" }]}><ActivityIndicator size="small" color="#fff" /></View>;

  return (
    <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
      <View style={[styles.matchBoxContainer, isLive && styles.liveBox, isFinished && styles.finishedBox]}>
        <Pressable style={styles.matchRow} onPress={toggleStats} delayLongPress={400} onLongPress={handleLongPress}>
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

        {showStats && (
          <Animated.View style={[styles.statsCard, { transform: [{ translateY: statsTranslate }], opacity: statsOpacity }]}>
            <Text style={styles.statsTitle}>{FOOTBALL_LABELS_EN["Buteurs"]}</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
              <View style={{ width: "48%" }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 10 }}>{name_team_left}</Text>
                {goals?.home?.map((g, i) => <Text key={`goal-home-${i}`} style={{ color: "#ddd", fontSize: 10 }}>{g.player} ({g.minute})</Text>)}
              </View>
              <View style={{ width: "48%", alignItems: "flex-end" }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 10 }}>{name_team_right}</Text>
                {goals?.away?.map((g, i) => <Text key={`goal-away-${i}`} style={{ color: "#ddd", fontSize: 10 }}>{g.player} ({g.minute})</Text>)}
              </View>
            </View>

            {(showDetails || alwaysOpen) && (
              <View style={{ marginTop: 12 }}>
                {Object.entries(stats).map(([label, val], i) => renderStatRow(label, val.home, val.away, i))}
                {goalStats.map((s, i) => {
                  if (!s?.title) return null;
                  const titleEN = FOOTBALL_LABELS_EN[s.title] || s.title;
                  const homeVal = s?.homeMain ?? s?.left?.main ?? s?.home ?? "-";
                  const awayVal = s?.awayMain ?? s?.right?.main ?? s?.away ?? "-";
                  return renderStatRow(titleEN, homeVal, awayVal, i + 100);
                })}
                {renderTeam(homeTeam, team_left, "home")}
                {renderTeam(awayTeam, team_right, "away")}
              </View>
            )}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export default memo(MatchBox, (prev, next) => (
  prev.home_score === next.home_score &&
  prev.away_score === next.away_score &&
  prev.status === next.status &&
  prev.time === next.time &&
  prev.showDetails === next.showDetails &&
  prev.alwaysOpen === next.alwaysOpen
));

const styles = StyleSheet.create({
  matchBoxContainer: {
    width: "100%",
    backgroundColor: "#001228",
    borderRadius: 6,
    marginVertical: 4,
    overflow: "hidden",
  },
  liveBox: {
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderLeftColor: "#0e8b00",
    borderRightColor: "#0e8b00",
  },
  finishedBox: {
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderLeftColor: "#ff2d2d",
    borderRightColor: "#ff2d2d",
    opacity: 0.95,
  },
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
  teamLogoSmall: { width: 25, height: 25},
});
