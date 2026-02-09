import React from "react";
import { ScrollView } from "react-native";
import MatchBox from "../app/components/MatchBox";

export default function MatchStatsScreen({ route, navigation }) {
  const selectedMatch = route?.params?.selectedMatch || null;

  if (!selectedMatch) return null;

  const defaultLineupData = {
    leagueName: "",
    leagueLogo: "",
    home: {
      formation: "4-4-3",
      coach: "",
      players: [],
      stats: {
        possession: 50,
        shots: 0,
        shotsOnTarget: 0,
        fouls: 0,
        corners: 0,
      },
    },
    away: {
      formation: "4-4-3",
      coach: "",
      players: [],
      stats: {
        possession: 50,
        shots: 0,
        shotsOnTarget: 0,
        fouls: 0,
        corners: 0,
      },
    },
  };

  const homeTeam = {
    name: selectedMatch.name_team_left,
    ...(selectedMatch.matchData?.home || defaultLineupData.home),
  };

  const awayTeam = {
    name: selectedMatch.name_team_right,
    ...(selectedMatch.matchData?.away || defaultLineupData.away),
  };

  const leagueLogo =
    selectedMatch.matchData?.leagueLogo || defaultLineupData.leagueLogo;

  const leagueName =
    selectedMatch.matchData?.leagueName || defaultLineupData.leagueName;

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
