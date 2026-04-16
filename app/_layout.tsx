import { Stack } from "expo-router";
import { useEffect } from "react";
import { setAudioModeAsync } from "expo-audio";

export default function RootLayout() {
  useEffect(() => {
    // Enable background audio mode globally
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix", // doNotMix is recommended for lockscreen controls on Android/iOS
    }).catch(console.error);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="player" />
    </Stack>
  );
}
