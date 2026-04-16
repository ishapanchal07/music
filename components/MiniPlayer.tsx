import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAudioContext } from "../contexts/AudioContext";
import { useProfileContext, THEMES, COLORS } from "../contexts/ProfileContext";
import { LinearGradient } from "expo-linear-gradient";

export default function MiniPlayer() {
  const router = useRouter();
  const { currentSong, status, togglePlayPause } = useAudioContext();
  const { themeMode, themeColor } = useProfileContext();

  if (!currentSong) return null;

  const t = THEMES[themeMode];
  const c = COLORS[themeColor];

  const formatSongName = (name: string) => name ? name.replace(/\.[^/.]+$/, "") : "";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/player")}
      style={[styles.container, { backgroundColor: t.surfaceHighlight, borderColor: t.surfaceHighlight }]}
    >
      <LinearGradient colors={[c[0], c[1]]} style={styles.albumIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <MaterialIcons name="music-note" size={24} color="#fff" />
      </LinearGradient>

      <View style={styles.info}>
        <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
          {formatSongName(currentSong.name)}
        </Text>
        <Text style={[styles.artist, { color: t.textMuted }]}>Play Full Screen</Text>
      </View>

      <TouchableOpacity onPress={togglePlayPause} style={styles.playButton} hitSlop={{top:15,bottom:15,left:15,right:15}}>
        <MaterialIcons name={status?.playing ? "pause" : "play-arrow"} size={32} color={t.text} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 85, // Above bottom tabs natively
    left: 8,
    right: 8,
    height: 64,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
  },
  albumIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  artist: {
    fontSize: 13,
  },
  playButton: {
    padding: 8,
  }
});
