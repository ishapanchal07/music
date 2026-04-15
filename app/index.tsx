import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Song = {
  name: string;
  url: string;
};

export default function Index() {
  const [songs, setSongs] = useState<Song[]>([]);
  const router = useRouter();

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    });
    if (!result.canceled) {
      const files = result.assets.map((file) => ({
        name: file.name,
        uri: file.uri,
      }));

      setSongs(files);
    }
  };

  const formateSongName = (name: string) => {
    return name.replace(/\.[^/.]+$/, "").substring(0, 40);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="music-note" size={24} color="#6366f1" />
        <Text style={styles.headerTitle}>Music Playlist</Text>
        <Text style={styles.headerSubtitle}>
          {songs.length} song{songs.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={pickAudio}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Music</Text>
      </TouchableOpacity>

      {songs.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="music-note" size={64} color="#d1d5db" />
          <Text style={styles.emptyMessage}>No songs yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the button above to add your favorite songs
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item, index) => index.toString()}
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
                <MaterialIcons name="music-note" size={24} color="#6366f1" />
              </View>

              <View style={styles.songInfo}>
                <Text style={styles.songName} numberOfLines={1}>
                  {formateSongName(item.name)}
                </Text>
                <Text style={styles.songIndex}>Track {index + 1}</Text>
              </View>
              <MaterialIcons
                name="play-circle-filled"
                size={28}
                color="#6366f1"
              />
            </TouchableOpacity>
          )}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#f9fafb",
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7180",
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  emptyState: { alignItems: "center", marginTop: 40 },
  emptyMessage: { fontSize: 18, fontWeight: "600", marginTop: 10 },
  emptySubtext: { fontSize: 14, color: "#6b7280", marginTop: 4 },

  songsItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  songIcon: { marginRight: 10 },
  songInfo: {},
  songIndex: { fontSize: 16 },
});
