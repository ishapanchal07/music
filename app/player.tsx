import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";

type Song = {
  name: string;
  uri: string;
};

export default function PlayerScreen() {
  const router = useRouter();
  const { songs, index } = useLocalSearchParams();

  const parsedSongs: Song[] = songs ? JSON.parse(songs as string) : [];

  const [currentIndex, setCurrentIndex] = useState(Number(index) || 0);
  const currentSong = parsedSongs[currentIndex];

  const [initialUri] = useState(currentSong?.uri);
  const player = useAudioPlayer(initialUri);
  const status = useAudioPlayerStatus(player);
  
  const [isLooping, setIsLooping] = useState(false);
  const isFirstRender = useRef(true);

  // Animation values
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(status.playing ? 1.05 : 1.0);
  }, [status.playing, scale]);

  const animatedAlbumStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Handle Playback & Lockscreen Data
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      player.play();
      player.setActiveForLockScreen(true, {
         title: formatSongName(currentSong?.name || "Unknown Track"),
      });
      return;
    }
    if (currentSong?.uri) {
      player.replace(currentSong.uri);
      player.play();
      player.setActiveForLockScreen(true, {
         title: formatSongName(currentSong.name || "Unknown Track"),
      });
    }
  }, [currentIndex, currentSong?.uri, player]);

  // Sync Loop Status
  useEffect(() => {
    if (player) {
       player.loop = isLooping;
    }
  }, [isLooping, player]);

  const togglePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const toggleLoop = () => {
    setIsLooping((prev) => !prev);
  };

  const nextSong = () => {
    setCurrentIndex((prev) => (prev === parsedSongs.length - 1 ? 0 : prev + 1));
  };

  const prevSong = () => {
    setCurrentIndex((prev) => (prev === 0 ? parsedSongs.length - 1 : prev - 1));
  };

  const seekAudio = async (value: number) => {
    await player.seekTo(value);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatSongName = (name: string) => {
    return name ? name.replace(/\.[^/.]+$/, "") : "";
  };

  if (!currentSong) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{color: '#fff'}}>No song found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={["#1e1b4b", "#0f172a", "#020617"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="keyboard-arrow-down" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <Animated.View style={[styles.albumArt, animatedAlbumStyle]}>
          <LinearGradient
            colors={["#4338ca", "#312e81"]}
            style={styles.albumArtGradient}
          >
           <MaterialIcons name="music-note" size={100} color="#c7d2fe" />
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Song Details */}
      <View style={styles.songDetailsContainer}>
        <Text style={styles.songTitle} numberOfLines={2}>
          {formatSongName(currentSong.name)}
        </Text>
        <Text style={styles.trackNumber}>
          Unknown Artist
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={status.duration || 1}
          value={status.currentTime || 0}
          onSlidingComplete={seekAudio}
          minimumTrackTintColor="#e879f9"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="#e879f9"
        />

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(status.currentTime || 0)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(status.duration || 0)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={toggleLoop}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name={isLooping ? "repeat-one" : "repeat"} 
            size={28} 
            color={isLooping ? "#e879f9" : "#64748b"} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={prevSong}
          activeOpacity={0.7}
        >
          <MaterialIcons name="skip-previous" size={40} color="#f8fafc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#e879f9", "#c026d3"]}
            style={styles.playButtonGradient}
          >
            <MaterialIcons
              name={status.playing ? "pause" : "play-arrow"}
              size={40}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={nextSong}
          activeOpacity={0.7}
        >
          <MaterialIcons name="skip-next" size={40} color="#f8fafc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="favorite-border" size={28} color="#64748b" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cbd5e1",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  albumArtContainer: {
    alignItems: "center",
    marginVertical: 40,
    paddingHorizontal: 32,
  },
  albumArt: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    overflow: "hidden",
  },
  albumArtGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  songDetailsContainer: {
    alignItems: "flex-start",
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 6,
  },
  trackNumber: {
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "500",
  },
  progressContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8,
  },
  timeText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  controlButton: {
    padding: 10,
  },
  secondaryButton: {
    padding: 10,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    shadowColor: "#e879f9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  playButtonGradient: {
    flex: 1,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
