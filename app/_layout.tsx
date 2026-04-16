import { Stack } from "expo-router";
import { useEffect } from "react";
import { setAudioModeAsync } from "expo-audio";
import { AudioProvider } from "../contexts/AudioContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import MiniPlayer from "../components/MiniPlayer";

export default function RootLayout() {
  useEffect(() => {
    try {
      setAudioModeAsync({
        playsInSilentMode: true,
        // Set this to `false` temporarily because Expo Go aggressively crashes when asked
        // to bind a native background audio service over the air.
        // Once you build a Dev Client APK, you can safely turn this back to `true`!
        shouldPlayInBackground: false,
        interruptionMode: "doNotMix",
      }).catch((e) => console.warn("Background mode failed:", e));
    } catch (e) {
      console.warn("Failed to set audio mode", e);
    }
  }, []);

  return (
    <ProfileProvider>
      <AudioProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="player" options={{ presentation: 'modal' }} />
        </Stack>
        <MiniPlayer />
      </AudioProvider>
    </ProfileProvider>
  );
}
