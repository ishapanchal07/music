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
        shouldPlayInBackground: true,
        interruptionMode: "doNotMix",
      }).catch((e) => console.warn("Background mode failed (expected on Expo Go):", e));
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
