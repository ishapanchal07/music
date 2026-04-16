import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAudioContext } from "../../contexts/AudioContext";
import { useProfileContext, THEMES, COLORS } from "../../contexts/ProfileContext";

export default function Home() {
  const { library, addSongsToLibrary, removeSongFromLibrary, playSong, isFavorite, toggleFavorite } = useAudioContext();
  const { username, themeMode, themeColor } = useProfileContext();
  
  const [searchQuery, setSearchQuery] = useState("");

  const t = THEMES[themeMode];
  const c = COLORS[themeColor];

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    });
    if (!result.canceled && result.assets) {
      const newFiles = result.assets.map(file => ({ name: file.name ?? "Unknown", uri: file.uri }));
      addSongsToLibrary(newFiles);
    }
  };

  const formatSongName = (n: string) => n ? n.replace(/\.[^/.]+$/, "").substring(0, 40) : "";

  const filteredLibrary = useMemo(() => {
    if (!searchQuery.trim()) return library;
    return library.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [library, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={['top']}>
      {themeMode === 'dark' && (
        <LinearGradient
          colors={[c[1], t.background, t.background]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.6 }}
          opacity={0.15}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: t.text }]}>Hello, {username}</Text>
          <Text style={[styles.headerTitle, { color: t.text }]}>Your Library</Text>
        </View>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: t.surfaceHighlight }]} onPress={pickAudio} activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color={t.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: t.surfaceHighlight }]}>
          <MaterialIcons name="search" size={20} color={t.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: t.text }]}
            placeholder="Search your songs..."
            placeholderTextColor={t.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Lists */}
      {library.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="library-music" size={80} color={t.surfaceHighlight} />
          <Text style={[styles.emptyMessage, { color: t.text }]}>Your library is empty</Text>
          <Text style={[styles.emptySubtext, { color: t.textMuted }]}>
            Tap the + button to add your favorite tracks
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLibrary}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.songsItem}
              onPress={() => playSong(index, filteredLibrary)}
              activeOpacity={0.7}
            >
              <LinearGradient colors={[c[0], c[1]]} style={styles.songIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialIcons name="music-note" size={24} color="#fff" />
              </LinearGradient>

              <View style={styles.songInfo}>
                <Text style={[styles.songName, { color: t.text }]} numberOfLines={1}>
                  {formatSongName(item.name)}
                </Text>
                <Text style={[styles.songArtist, { color: t.textMuted }]}>Unknown Artist</Text>
              </View>

              <TouchableOpacity onPress={() => toggleFavorite(item)} hitSlop={10} style={{marginRight: 15}}>
                <MaterialIcons name={isFavorite(item.uri) ? "favorite" : "favorite-border"} size={22} color={isFavorite(item.uri) ? c[0] : t.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteIcon} onPress={() => removeSongFromLibrary(item.uri)}>
                <MaterialIcons name="close" size={20} color={t.textMuted} />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 15,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  songInfo: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  songName: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 13,
  },
  deleteIcon: {
    padding: 8,
  },
});
