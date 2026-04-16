import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      player.play();
      return;
    }
    if (currentSong?.uri) {
      player.replace(currentSong.uri);
      player.play();
    }
  }, [currentIndex, currentSong?.uri, player]);

  const togglePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
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
    return name.replace(/\.[^/.]+$/, "");
  };

  if (!currentSong) {
    return <Text>No song found</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <View style={styles.albumArt}>
          <MaterialIcons name="music-note" size={80} color="#6366f1" />
        </View>
      </View>

      {/* Song Details */}
      <View style={styles.songDetailsContainer}>
        <Text style={styles.songTitle} numberOfLines={2}>
          {formatSongName(currentSong.name)}
        </Text>
        <Text style={styles.trackNumber}>
          Track {currentIndex + 1} of {parsedSongs.length}
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
          minimumTrackTintColor="#6366f1"
          maximumTrackTintColor="#e5e7eb"
          thumbTintColor="#6366f1"
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
          style={styles.controlButton}
          onPress={prevSong}
          activeOpacity={0.7}
        >
          <MaterialIcons name="skip-previous" size={32} color="#6366f1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={
              status.playing ? "pause-circle-filled" : "play-circle-filled"
            }
            size={32}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={nextSong}
          activeOpacity={0.7}
        >
          <MaterialIcons name="skip-next" size={32} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Queue */}
      <View style={styles.queueContainer}>
        <Text style={styles.queueTitle}>Up Next</Text>
        {parsedSongs.length > 1 && (
          <Text style={styles.nextSongText}>
            {formatSongName(
              parsedSongs[(currentIndex + 1) % parsedSongs.length].name,
            )}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
  },
  albumArtContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  songDetailsContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  trackNumber: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  progressContainer: {
    marginBottom: 32,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 32,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  queueContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  queueTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  nextSongText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});
