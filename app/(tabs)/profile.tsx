import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfileContext, ThemeColor, THEMES, COLORS } from "../../contexts/ProfileContext";
import { useAudioContext } from "../../contexts/AudioContext";

export default function Profile() {
  const { username, email, profilePicUri, themeMode, themeColor, toggleThemeMode, setThemeColor, loginWithGoogle, logout, isLoggingIn } = useProfileContext();
  const { library, favorites, recentlyPlayed } = useAudioContext();

  const t = THEMES[themeMode];
  const c = COLORS[themeColor];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: t.text }]}>Profile</Text>
          <TouchableOpacity onPress={toggleThemeMode}>
            <MaterialIcons name={themeMode === 'dark' ? "light-mode" : "dark-mode"} size={28} color={t.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.imageContainer}>
            {profilePicUri ? (
              <Image source={{ uri: profilePicUri }} style={styles.profileImage} />
            ) : (
              <LinearGradient colors={[c[0], c[1]]} style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={60} color="#fff" />
              </LinearGradient>
            )}
          </View>

          <View style={styles.nameContainer}>
            <Text style={[styles.username, { color: t.text }]}>{username}</Text>
          </View>
          {email && <Text style={[styles.emailText, { color: t.textMuted }]}>{email}</Text>}

          {/* Social Auth Controls */}
          {email ? (
             <TouchableOpacity style={[styles.authButton, { backgroundColor: t.surfaceHighlight, marginTop: 15 }]} onPress={logout}>
               <MaterialIcons name="logout" size={20} color={t.text} />
               <Text style={[styles.authButtonText, { color: t.text }]}>Sign out</Text>
             </TouchableOpacity>
          ) : (
             <TouchableOpacity style={[styles.authButton, { backgroundColor: '#DB4437', marginTop: 15 }]} onPress={loginWithGoogle} disabled={isLoggingIn}>
               {isLoggingIn ? <ActivityIndicator color="#fff" /> : <MaterialIcons name="login" size={20} color="#fff" />}
               <Text style={[styles.authButtonText, { color: '#fff' }]}>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</Text>
             </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: t.surface }]}>
            <Text style={[styles.statNumber, { color: c[0] }]}>{library.length}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Total Songs</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: t.surface }]}>
            <Text style={[styles.statNumber, { color: c[0] }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Favorites</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: t.surface }]}>
            <Text style={[styles.statNumber, { color: c[0] }]}>{recentlyPlayed.length}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Recently Played</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: t.text }]}>Theme Color</Text>
        <View style={styles.colorsContainer}>
          {(Object.keys(COLORS) as ThemeColor[]).map((colorKey) => (
            <TouchableOpacity key={colorKey} onPress={() => setThemeColor(colorKey)} style={styles.colorCircleWrapper}>
              <LinearGradient colors={[COLORS[colorKey][0], COLORS[colorKey][1]]} style={styles.colorCircle} />
              {themeColor === colorKey && (
                <View style={styles.colorSelectedIndicator}>
                  <MaterialIcons name="check" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: t.text }]}>Recently Played</Text>
        <View style={styles.recentContainer}>
          {recentlyPlayed.length === 0 ? (
             <Text style={{color: t.textMuted}}>No recently played tracks.</Text>
          ) : (
             recentlyPlayed.map((s, i) => (
                 <View key={i} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}>
                   <MaterialIcons name="history" size={20} color={t.textMuted} />
                 <View style={{marginLeft: 10, flex: 1, flexShrink: 1}}>
                     <Text style={{color: t.text, fontSize: 16, fontWeight: '500', flexShrink: 1}} numberOfLines={1}>
                       {s.metadata?.title || s.name.replace(/\.[^/.]+$/, "")}
                     </Text>
                     <Text style={{color: t.textMuted, fontSize: 13, flexShrink: 1}} numberOfLines={1}>
                       {s.metadata?.artist || "Unknown Artist"}
                     </Text>
                   </View>
                 </View>
             ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  profileHeader: { alignItems: 'center', marginTop: 20 },
  imageContainer: { width: 140, height: 140, borderRadius: 70, marginBottom: 15, elevation: 5 },
  profileImage: { width: '100%', height: '100%', borderRadius: 70 },
  profileImagePlaceholder: { flex: 1, borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  nameContainer: { flexDirection: 'row', alignItems: 'center' },
  username: { fontSize: 24, fontWeight: '700' },
  emailText: { fontSize: 14, marginTop: 4 },
  authButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  authButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 40 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 20, borderRadius: 16, marginHorizontal: 6 },
  statNumber: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 24, marginTop: 40, marginBottom: 16 },
  colorsContainer: { flexDirection: 'row', paddingHorizontal: 24, flexWrap: 'wrap', gap: 16 },
  colorCircleWrapper: { width: 48, height: 48, borderRadius: 24 },
  colorCircle: { flex: 1, borderRadius: 24 },
  colorSelectedIndicator: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24 },
  recentContainer: { paddingHorizontal: 24 },
});
