// adsConfig.js
import Constants from "expo-constants";
import { AdMobBanner, AdMobInterstitial, AdMobRewarded } from "expo-ads-admob";

const isDev = Constants.manifest?.extra?.devMode ?? __DEV__; // Dev mode detection

// Test Ad Unit IDs من Google
export const testBannerId = "ca-app-pub-3940256099942544/6300978111";
export const testInterstitialId = "ca-app-pub-3940256099942544/1033173712";
export const testRewardedId = "ca-app-pub-3940256099942544/5224354917";

// Ad Unit الحقيقي (يمكن تغييره لاحقًا في Production)
export const realBannerId = "ca-app-pub-1283986840536864/1399899772";
export const realInterstitialId = "ca-app-pub-1283986840536864/1399899772";
export const realRewardedId = "ca-app-pub-1283986840536864/1399899772";

// اختيار ID حسب وضع Dev / Prod
export const bannerUnitId = isDev ? testBannerId : realBannerId;
export const interstitialUnitId = isDev ? testInterstitialId : realInterstitialId;
export const rewardedUnitId = isDev ? testRewardedId : realRewardedId;

export { AdMobBanner, AdMobInterstitial, AdMobRewarded };
