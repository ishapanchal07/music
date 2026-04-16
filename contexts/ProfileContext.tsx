import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export type ThemeColor = "indigo" | "rose" | "emerald" | "amber" | "sky";
export type ThemeMode = "dark" | "light";

type ProfileContextType = {
  username: string;
  email: string | null;
  profilePicUri: string | null;
  themeMode: ThemeMode;
  themeColor: ThemeColor;
  isLoggingIn: boolean;
  updateProfile: (name: string, uri: string | null) => void;
  toggleThemeMode: () => void;
  setThemeColor: (color: ThemeColor) => void;
  loginWithGoogle: () => void;
  logout: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const THEMES = {
  dark: {
    background: "#020617",
    surface: "#0f172a",
    surfaceHighlight: "#1e293b",
    text: "#f8fafc",
    textMuted: "#94a3b8",
  },
  light: {
    background: "#f8fafc",
    surface: "#f1f5f9",
    surfaceHighlight: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
  }
};

export const COLORS = {
  indigo: ["#818cf8", "#4f46e5"],
  rose: ["#fb7185", "#e11d48"],
  emerald: ["#34d399", "#059669"],
  amber: ["#fbbf24", "#d97706"],
  sky: ["#38bdf8", "#0284c7"],
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("Music Lover");
  const [email, setEmail] = useState<string | null>(null);
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [themeColor, setThemeColorState] = useState<ThemeColor>("indigo");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const loadPrf = async () => {
      try {
        const u = await AsyncStorage.getItem("@user_name");
        const m = await AsyncStorage.getItem("@user_email");
        const p = await AsyncStorage.getItem("@user_pic");
        const mode = await AsyncStorage.getItem("@theme_mode");
        const color = await AsyncStorage.getItem("@theme_color");
        if (u) setUsername(u);
        if (m) setEmail(m);
        if (p) setProfilePicUri(p);
        if (mode === "dark" || mode === "light") setThemeMode(mode);
        if (color && Object.keys(COLORS).includes(color)) setThemeColorState(color as ThemeColor);
      } catch (e) {
        console.error(e);
      }
    };
    loadPrf();
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  });

  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success") {
        const auth = response.authentication;
        if (!auth?.accessToken) return;
        
        setIsLoggingIn(true);
        try {
          const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
          });
          const user = await res.json();
          
          setUsername(user.name);
          setEmail(user.email);
          setProfilePicUri(user.picture);
          
          await AsyncStorage.setItem("@user_name", user.name);
          await AsyncStorage.setItem("@user_email", user.email);
          await AsyncStorage.setItem("@user_pic", user.picture);
        } catch (e) {
          console.error("Google Info fetch failed", e);
        } finally {
          setIsLoggingIn(false);
        }
      }
    };
    handleAuth();
  }, [response]);

  const updateProfile = async (name: string, uri: string | null) => {
    setUsername(name);
    setProfilePicUri(uri);
    try {
      await AsyncStorage.setItem("@user_name", name);
      if (uri) await AsyncStorage.setItem("@user_pic", uri);
      else await AsyncStorage.removeItem("@user_pic");
    } catch (e) {
      console.error(e);
    }
  };

  const loginWithGoogle = () => {
    promptAsync();
  };

  const logout = async () => {
    setUsername("Music Lover");
    setEmail(null);
    setProfilePicUri(null);
    await AsyncStorage.removeItem("@user_name");
    await AsyncStorage.removeItem("@user_email");
    await AsyncStorage.removeItem("@user_pic");
  };

  const toggleThemeMode = async () => {
    const mode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(mode);
    await AsyncStorage.setItem("@theme_mode", mode);
  };

  const setThemeColor = async (color: ThemeColor) => {
    setThemeColorState(color);
    await AsyncStorage.setItem("@theme_color", color);
  };

  return (
    <ProfileContext.Provider value={{ 
      username, email, profilePicUri, themeMode, themeColor, isLoggingIn, 
      updateProfile, toggleThemeMode, setThemeColor, loginWithGoogle, logout 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfileContext must be used within ProfileProvider");
  return context;
}
