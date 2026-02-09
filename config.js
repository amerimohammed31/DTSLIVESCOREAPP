const GITHUB_JSON_URL = "https://raw.githubusercontent.com/amerimohammed31/LiveScore/refs/heads/main/ApisLiveScore.json";

let CONFIG = {};
let CONTINENT_LOGOS = {};
let LEAGUES = {};

export async function fetchConfigFromGitHub() {
  try {
    const res = await fetch(GITHUB_JSON_URL);
    const data = await res.json();

    CONFIG = data.CONFIG || {};
    CONTINENT_LOGOS = data.CONTINENT_LOGOS || {};
    LEAGUES = data.LEAGUES || {};

    console.log("✅ Config loaded from GitHub");
    return { CONFIG, CONTINENT_LOGOS, LEAGUES };
  } catch (error) {
    console.error("❌ Error fetching config from GitHub:", error);
    return { CONFIG, CONTINENT_LOGOS, LEAGUES };
  }
}

export async function fetchSupportedLeaguesByContinent() {
  try {
    if (!CONFIG.STANDINGS_URL || Object.keys(LEAGUES).length === 0) {
      await fetchConfigFromGitHub();
    }

    const res = await fetch(CONFIG.STANDINGS_URL);
    const data = await res.json();

    if (!data?.supported || !Array.isArray(data.supported)) return {};

    const supportedLeagues = data.supported
      .map((key) => LEAGUES[key])
      .filter(Boolean);

    const leaguesByContinent = supportedLeagues.reduce((acc, league) => {
      const cont = league.continent || "europe";
      if (!acc[cont]) acc[cont] = [];
      acc[cont].push(league);
      return acc;
    }, {});

    return leaguesByContinent;
  } catch (error) {
    console.error("❌ Error fetching supported leagues:", error);
    return {};
  }
}
