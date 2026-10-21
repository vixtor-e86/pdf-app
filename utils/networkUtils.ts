import * as Network from "expo-network";

/**
 * Robust check for active internet connectivity.
 * Combines native network state check with a fast, lightweight 0-byte ping.
 */
export async function checkInternetConnection(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();

    // If native state reports no connection or unreachable
    if (state.isConnected === false || state.isInternetReachable === false) {
      return false;
    }

    // Fast reachability check with 2.5s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch("https://clients3.google.com/generate_204", {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.status === 204 || res.ok;
    } catch {
      clearTimeout(timeout);
      // If ping was blocked by corporate firewall or timed out, trust native state
      return state.isConnected ?? false;
    }
  } catch (err) {
    // Fallback direct check
    try {
      const res = await fetch("https://clients3.google.com/generate_204", {
        method: "HEAD",
      });
      return res.status === 204 || res.ok;
    } catch {
      return false;
    }
  }
}
