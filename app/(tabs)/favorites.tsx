import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAudioContext } from "../../contexts/AudioContext";
import { useProfileContext, THEMES, COLORS } from "../../contexts/ProfileContext";

export default function Favorites() {
  const { favorites, playSong, toggleFavorite } = useAudioContext();
  const { themeMode, themeColor } = useProfileContext();

  const t = THEMES[themeMode];
  const c = COLORS[themeColor];
  const formatSongName = (n: string) => n ? n.replace(/\.[^/.]+$/, "").substring(0, 40) : "";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: t.text }]}>Favorites</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="favorite-border" size={80} color={t.surfaceHighlight} />
          <Text style={[styles.emptyMessage, { color: t.text }]}>No favorites yet</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.songsItem} onPress={() => playSong(index, favorites)} activeOpacity={0.7}>
              <LinearGradient colors={[c[0], c[1]]} style={styles.songIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialIcons name="favorite" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.songInfo}>
                <Text style={[styles.songName, { color: t.text }]} numberOfLines={1}>{formatSongName(item.name)}</Text>
                <Text style={[styles.songArtist, { color: t.textMuted }]}>Unknown Artist</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item)} hitSlop={10} style={{padding: 8}}>
                <MaterialIcons name="favorite" size={22} color={c[0]} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  emptyState: { alignItems: "center", justifyContent: "center", flex: 1, paddingHorizontal: 32 },
  emptyMessage: { fontSize: 20, fontWeight: "700", marginTop: 20 },
  songsItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  songIcon: { width: 48, height: 48, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 16 },
  songInfo: { flex: 1, flexShrink: 1, marginRight: 12 },
  songName: { fontSize: 16, fontWeight: "600", flexShrink: 1, marginBottom: 4 },
  songArtist: { fontSize: 13 },
});
