import React, { useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import analytics from "@react-native-firebase/analytics";
import { useNavigationContainerRef } from "expo-router";
import HomeScreen from "./screens/HomeScreen";
import Ranking from "./app/components/Ranking";
import ContinentLeagues from "./screens/ContinentLeagues";
import LeagueRanking from "./screens/LeagueRanking";
import PrivacyPolicy from "./screens/PrivacyPolicy";
import WorldTournamentsScreen from "./screens/WorldTournamentsScreen";
import MatchStatsScreen from "./screens/MatchStatsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      screenListeners={{
        state: async () => {
          const currentRouteName =
            navigationRef.getCurrentRoute()?.name;

          if (routeNameRef.current !== currentRouteName) {
            try {
              await analytics().logScreenView({
                screen_name: currentRouteName,
                screen_class: currentRouteName,
              });
            } catch (e) {
              console.log("Analytics error:", e);
            }
          }

          routeNameRef.current = currentRouteName;
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Ranking" component={Ranking} />
      <Stack.Screen name="ContinentLeagues" component={ContinentLeagues} />
      <Stack.Screen name="LeagueRanking" component={LeagueRanking} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen
        name="WorldTournamentsScreen"
        component={WorldTournamentsScreen}
      />
      <Stack.Screen
        name="MatchStatsScreen"
        component={MatchStatsScreen}
      />
    </Stack.Navigator>
  );
}