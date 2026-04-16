import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useAudioContext } from "../contexts/AudioContext";
import { useProfileContext, THEMES, COLORS } from "../contexts/ProfileContext";

export default function PlayerScreen() {
  const router = useRouter();
  const { currentSong, status, isLooping, isShuffle, togglePlayPause, toggleLoop, toggleShuffle, nextSong, prevSong, seek, isFavorite, toggleFavorite } = useAudioContext();
  const { themeMode, themeColor } = useProfileContext();
  
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsText, setLyricsText] = useState("Loading lyrics...");

  useEffect(() => {
    if (showLyrics && currentSong) {
      setLyricsText("Loading lyrics...");
      const artist = encodeURIComponent(currentSong.metadata?.artist || "");
      const track = encodeURIComponent(currentSong.metadata?.title || currentSong.name);
      
      fetch(`https://lrclib.net/api/search?track_name=${track}&artist_name=${artist}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0 && data[0].plainLyrics) {
            setLyricsText(data[0].plainLyrics);
          } else {
             // Fallback to title only if artist/title sync fails
             fetch(`https://lrclib.net/api/search?track_name=${track}`)
               .then(r => r.json())
               .then(d => {
                  if (d && d.length > 0 && d[0].plainLyrics) setLyricsText(d[0].plainLyrics);
                  else setLyricsText("No lyrics found online for this track.");
               }).catch(() => setLyricsText("No lyrics found online for this track."));
          }
        })
        .catch(() => setLyricsText("Failed to retrieve lyrics. Please check your net connection."));
    }
  }, [showLyrics, currentSong]);

  const t = THEMES[themeMode];
  const c = COLORS[themeColor];

  const formatSongName = (name: string) => name ? name.replace(/\.[^/.]+$/, "") : "";
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const totalSeconds = Math.floor(seconds);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentSong) {
    return (
      <View style={[styles.container, { backgroundColor: t.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={{position: 'absolute', top: 50, left: 20}}>
          <MaterialIcons name="keyboard-arrow-down" size={32} color={t.text} />
        </TouchableOpacity>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: t.text}}>No song playing</Text>
        </View>
      </View>
    );
  }

  const animatedAlbumStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(status.playing ? 1.02 : 0.95) }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={['top', 'bottom']}>
      {themeMode === 'dark' && (
        <LinearGradient
          colors={[c[1], t.background, t.background]}
          style={StyleSheet.absoluteFillObject}
          opacity={0.3}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialIcons name="keyboard-arrow-down" size={36} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Now Playing</Text>
        <TouchableOpacity onPress={() => setShowLyrics(!showLyrics)} style={styles.iconBtn}>
          <MaterialIcons name={showLyrics ? "album" : "lyrics"} size={26} color={showLyrics ? c[0] : t.text} />
        </TouchableOpacity>
      </View>

      {/* Album Art or Lyrics */}
      {showLyrics ? (
        <ScrollView style={styles.lyricsContainer} showsVerticalScrollIndicator={false}>
           <Text style={[styles.lyricsText, { color: t.text }]}>
             {lyricsText}
           </Text>
        </ScrollView>
      ) : (
        <View style={styles.albumArtContainer}>
          <Animated.View style={[styles.albumArt, animatedAlbumStyle, { backgroundColor: t.surface }]}>
            <LinearGradient colors={[c[0], c[1]]} style={styles.albumArtGradient}>
             <MaterialIcons name="music-note" size={120} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </View>
      )}

      {/* Song Details */}
      <View style={styles.songDetailsContainer}>
        <View style={{flex: 1, paddingRight: 20}}>
          <Text style={[styles.songTitle, { color: t.text }]} numberOfLines={2}>
            {currentSong.metadata?.title || formatSongName(currentSong.name)}
          </Text>
          <Text style={[styles.trackArtist, { color: t.textMuted }]}>
            {currentSong.metadata?.artist || "Unknown Artist"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(currentSong)}>
           <MaterialIcons name={isFavorite(currentSong.uri) ? "favorite" : "favorite-border"} size={28} color={isFavorite(currentSong.uri) ? c[0] : t.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={status.duration || 1}
          value={status.currentTime || 0}
          onSlidingComplete={seek}
          minimumTrackTintColor={c[0]}
          maximumTrackTintColor={t.surfaceHighlight}
          thumbTintColor={c[0]}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: t.textMuted }]}>{formatTime(status.currentTime || 0)}</Text>
          <Text style={[styles.timeText, { color: t.textMuted }]}>{formatTime(status.duration || 0)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleShuffle} activeOpacity={0.7} style={styles.subCtrl}>
          <MaterialIcons name="shuffle" size={24} color={isShuffle ? c[0] : t.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity onPress={prevSong} activeOpacity={0.7} style={styles.mainCtrl}>
          <MaterialIcons name="skip-previous" size={44} color={t.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} activeOpacity={0.8} style={styles.playButtonWrapper}>
          <LinearGradient colors={[c[0], c[1]]} style={styles.playButton}>
            <MaterialIcons name={status.playing ? "pause" : "play-arrow"} size={44} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={nextSong} activeOpacity={0.7} style={styles.mainCtrl}>
          <MaterialIcons name="skip-next" size={44} color={t.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleLoop} activeOpacity={0.7} style={styles.subCtrl}>
          <MaterialIcons name={isLooping ? "repeat-one" : "repeat"} size={24} color={isLooping ? c[0] : t.textMuted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 14, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  lyricsContainer: { flex: 1, marginHorizontal: 32, marginVertical: 20 },
  lyricsText: { fontSize: 22, lineHeight: 40, fontWeight: '700', textAlign: 'center', opacity: 0.9 },
  albumArtContainer: { flex: 1, alignItems: "center", justifyContent: 'center', paddingHorizontal: 32 },
  albumArt: { width: "100%", aspectRatio: 1, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 15, overflow: "hidden" },
  albumArtGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  songDetailsContainer: { flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', paddingHorizontal: 32, marginBottom: 25 },
  songTitle: { fontSize: 24, fontWeight: "800", marginBottom: 6 },
  trackArtist: { fontSize: 16, fontWeight: "500" },
  progressContainer: { paddingHorizontal: 24, marginBottom: 20 },
  slider: { width: "100%", height: 40 },
  timeContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginTop: -8 },
  timeText: { fontSize: 13, fontWeight: "500" },
  controlsContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 30, marginBottom: 40 },
  subCtrl: { padding: 10 },
  mainCtrl: { padding: 10 },
  playButtonWrapper: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  playButton: { width: 76, height: 76, borderRadius: 38, justifyContent: "center", alignItems: "center" },
});
