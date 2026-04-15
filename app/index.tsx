import { MaterialIcons } from "@expo/vector-icons"; // ✅ missing import
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Song = {
  name: string;
  url: string;
};

export default function Index() {
  const [songs, setSongs] = useState<Song[]>([]);
  const router = useRouter();

  const pickAudio = () => {
    // TODO: implement audio picker
    console.log("Pick audio clicked");
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

      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#f9fafb",
    flex: 1, // ✅ better layout
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
});
