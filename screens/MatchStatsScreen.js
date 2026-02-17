import React from "react";
import { ScrollView } from "react-native";
import MatchBox from "../app/components/MatchBox";

export default function MatchStatsScreen({ route, navigation }) {
  const selectedMatch = route?.params?.selectedMatch || null;

  if (!selectedMatch) return null;

  const homeTeam = {
    name: selectedMatch.name_team_left,
    formation: selectedMatch.matchData?.home?.formation || "",
    coach: selectedMatch.matchData?.home?.coach || "",
    players: selectedMatch.matchData?.home?.players || [],
    stats: selectedMatch.matchData?.home?.stats || {},
  };

  const awayTeam = {
    name: selectedMatch.name_team_right,
    formation: selectedMatch.matchData?.away?.formation || "",
    coach: selectedMatch.matchData?.away?.coach || "",
    players: selectedMatch.matchData?.away?.players || [],
    stats: selectedMatch.matchData?.away?.stats || {},
  };

  const leagueLogo = selectedMatch.matchData?.leagueLogo || "";
  const leagueName =
    selectedMatch.matchData?.leagueName ||
    selectedMatch.leagueName ||
    "";

  return (
    <ScrollView contentContainerStyle={{ padding: 5 }}>
      <MatchBox
        {...selectedMatch}
        navigation={navigation}
        team_left={selectedMatch.team_left}
        name_team_left={homeTeam.name}
        team_right={selectedMatch.team_right}
        name_team_right={awayTeam.name}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        leagueLogo={leagueLogo}
        leagueName={leagueName}
        alwaysOpen={true}
        showDetails={true}
      />
    </ScrollView>
  );
}
