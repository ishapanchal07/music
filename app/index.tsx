import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

type Song = {
  name: string;
  uri: string;
};

const STORAGE_KEY = "@music_player_songs";
const WELCOME_KEY = "@has_seen_welcome";

export default function Index() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadState = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem(WELCOME_KEY);
        if (!hasSeen) setShowWelcome(true);

        const savedSongs = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedSongs) {
          setSongs(JSON.parse(savedSongs));
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  const saveSongs = async (newSongs: Song[]) => {
    try {
      setSongs(newSongs);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSongs));
    } catch (e) {
      console.error("Failed to save songs", e);
    }
  };

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    });

    if (!result.canceled && result.assets) {
      const newFiles: Song[] = result.assets.map((file) => ({
        name: file.name ?? "Unknown",
        uri: file.uri,
      }));
      // Append to existing
      const combined = [...songs, ...newFiles];
      saveSongs(combined);
    }
  };

  const removeSong = (indexToRemove: number) => {
    const filtered = songs.filter((_, idx) => idx !== indexToRemove);
    saveSongs(filtered);
  };

  const handleStartListening = async () => {
    try {
      await AsyncStorage.setItem(WELCOME_KEY, "true");
      setShowWelcome(false);
    } catch (e) {
      console.error(e);
    }
  };

  const formatSongName = (name: string) => {
    return name.replace(/\.[^/.]+$/, "").substring(0, 40);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{color: '#fff', alignSelf: 'center'}}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Welcome Screen Modal */}
      <Modal visible={showWelcome} animationType="fade" transparent>
        <LinearGradient
          colors={["#0f172a", "#312e81", "#1e1b4b"]}
          style={styles.welcomeContainer}
        >
          <Animated.View entering={FadeInDown.duration(800).springify()}>
            <View style={styles.welcomeIconContainer}>
              <MaterialIcons name="headphones" size={80} color="#fff" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome 🎧</Text>
            <Text style={styles.welcomeSubtitle}>Your personal music oasis.</Text>
            
            <View style={styles.welcomeBadge}>
              <Text style={styles.welcomeBadgeText}>Made by Isha 💜</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(600).duration(800)} style={styles.welcomeButtonContainer}>
            <TouchableOpacity
              style={styles.startListeningButton}
              onPress={handleStartListening}
              activeOpacity={0.8}
            >
              <Text style={styles.startListeningText}>Start Listening</Text>
              <MaterialIcons name="arrow-forward" size={24} color="#111827" />
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </Modal>

      {/* Main App Background Gradient */}
      <LinearGradient
        colors={["#1e1b4b", "#0f172a", "#020617"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={pickAudio}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lists */}
      {songs.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="library-music" size={80} color="#334155" />
          <Text style={styles.emptyMessage}>Your library is empty</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your favorite tracks
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.songsItem}
              onPress={() =>
                router.push({
                  pathname: "/player",
                  params: {
                    index: index.toString(),
                    songs: JSON.stringify(songs),
                  },
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.songIcon}>
                <MaterialIcons name="music-note" size={24} color="#818cf8" />
              </View>

              <View style={styles.songInfo}>
                <Text style={styles.songName} numberOfLines={1}>
                  {formatSongName(item.name)}
                </Text>
                <Text style={styles.songArtist}>Unknown Artist</Text>
              </View>

              <TouchableOpacity style={styles.deleteIcon} onPress={() => removeSong(index)}>
                <MaterialIcons
                  name="close"
                  size={20}
                  color="#475569"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 32,
  },
  emptyMessage: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  songsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  songIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  songName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 13,
    color: "#64748b",
  },
  deleteIcon: {
    padding: 8,
  },
  // Welcome Modal Styles
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  welcomeIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 24,
  },
  welcomeBadge: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
  },
  welcomeBadgeText: {
    color: "#e879f9",
    fontWeight: "600",
    fontSize: 14,
  },
  welcomeButtonContainer: {
    position: "absolute",
    bottom: 60,
    left: 32,
    right: 32,
  },
  startListeningButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 30,
  },
  startListeningText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
});
