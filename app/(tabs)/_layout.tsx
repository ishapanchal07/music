import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useProfileContext, THEMES, COLORS } from "../../contexts/ProfileContext";

export default function TabLayout() {
  const { themeMode, themeColor } = useProfileContext();
  const t = THEMES[themeMode];
  const c = COLORS[themeColor];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.surfaceHighlight,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 15,
          paddingTop: 10,
        },
        tabBarActiveTintColor: c[0],
        tabBarInactiveTintColor: t.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
