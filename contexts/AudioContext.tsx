import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { extractMetadata } from "../utils/MetadataParser";

export type Song = {
  name: string;
  uri: string;
  metadata?: { title: string; artist: string; cleanName: string };
};

export type Playlist = {
  id: string;
  name: string;
  songs: Song[];
};

type AudioContextType = {
  library: Song[];
  favorites: Song[];
  recentlyPlayed: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  currentIndex: number;
  queue: Song[];
  player: any;
  status: any;
  isLooping: boolean;
  isShuffle: boolean;

  addSongsToLibrary: (songs: Song[]) => void;
  removeSongFromLibrary: (uri: string) => void;
  toggleFavorite: (song: Song) => void;
  isFavorite: (uri: string) => boolean;
  createPlaylist: (name: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, uri: string) => void;
  deletePlaylist: (playlistId: string) => void;
  playSong: (index: number, queue: Song[]) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  seek: (value: number) => Promise<void>;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [queue, setQueue] = useState<Song[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const currentSong = queue[currentIndex] || null;

  // Stable Player instance
  const [initialUri] = useState<string | null>(null);
  const player = useAudioPlayer(initialUri);
  const status = useAudioPlayerStatus(player);
  
  const isFirstRender = useRef(true);

  // Load Persisted Data
  useEffect(() => {
    const loadState = async () => {
      try {
        const [lib, fav, rec, pl] = await Promise.all([
          AsyncStorage.getItem("@music_lib"),
          AsyncStorage.getItem("@music_favs"),
          AsyncStorage.getItem("@music_recent"),
          AsyncStorage.getItem("@music_playlists"),
        ]);
        if (lib) setLibrary(JSON.parse(lib));
        if (fav) setFavorites(JSON.parse(fav));
        if (rec) setRecentlyPlayed(JSON.parse(rec));
        if (pl) setPlaylists(JSON.parse(pl));
      } catch (e) {
        console.error("Failed to load audio state", e);
      }
    };
    loadState();
  }, []);

  const persistState = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  };

  // Playback Effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (currentSong?.uri && player) {
      player.replace(currentSong.uri);
      player.play();
      
      const formatName = currentSong.name ? currentSong.name.replace(/\.[^/.]+$/, "") : "Unknown Track";
      
      try {
        player.setActiveForLockScreen(true, { title: formatName });
      } catch (err) {
        console.warn("Skipping native lockscreen config (Expected on Expo Go)");
      }

      // Add to recently played (keep last 10)
      setRecentlyPlayed((prev) => {
        const filtered = prev.filter(s => s.uri !== currentSong.uri);
        const newRecent = [currentSong, ...filtered].slice(0, 10);
        persistState("@music_recent", newRecent);
        return newRecent;
      });
    }
  }, [currentIndex, currentSong?.uri]);

  // Sync Loop
  useEffect(() => {
    if (player) player.loop = isLooping;
  }, [isLooping, player]);

  // Watch for track natural end
  useEffect(() => {
    if (!currentSong || !player) return;
    if (!status.playing && status.duration > 0 && status.currentTime > 0 && Math.abs(status.currentTime - status.duration) < 1) {
      if (!isLooping) {
        // A little debounce so we don't trigger rapidly
        setTimeout(() => nextSong(), 200);
      }
    }
  }, [status.playing, status.currentTime, status.duration, isLooping]);

  const addSongsToLibrary = (songs: Song[]) => {
    const parsedSongs = songs.map(s => ({
       ...s,
       metadata: s.metadata || extractMetadata(s.name)
    }));
    setLibrary(prev => {
      const combined = [...prev, ...parsedSongs];
      const unique = combined.filter((v, i, a) => a.findIndex((t) => (t.uri === v.uri)) === i);
      persistState("@music_lib", unique);
      return unique;
    });
  };

  const removeSongFromLibrary = (uri: string) => {
    setLibrary(prev => {
      const filtered = prev.filter(s => s.uri !== uri);
      persistState("@music_lib", filtered);
      return filtered;
    });
  };

  const toggleFavorite = (song: Song) => {
    setFavorites(prev => {
      const isFav = prev.some(s => s.uri === song.uri);
      let newFavs;
      if (isFav) {
        newFavs = prev.filter(s => s.uri !== song.uri);
      } else {
        newFavs = [...prev, song];
      }
      persistState("@music_favs", newFavs);
      return newFavs;
    });
  };

  const isFavorite = (uri: string) => favorites.some(s => s.uri === uri);

  // Playlists
  const createPlaylist = (name: string) => {
    setPlaylists(prev => {
      const p = [...prev, { id: Date.now().toString(), name, songs: [] }];
      persistState("@music_playlists", p);
      return p;
    });
  };
  
  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId && !p.songs.some(s => s.uri === song.uri)) {
          return { ...p, songs: [...p.songs, song] };
        }
        return p;
      });
      persistState("@music_playlists", updated);
      return updated;
    });
  };

  const removeSongFromPlaylist = (playlistId: string, uri: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId) return { ...p, songs: p.songs.filter(s => s.uri !== uri) };
        return p;
      });
      persistState("@music_playlists", updated);
      return updated;
    });
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id !== playlistId);
      persistState("@music_playlists", updated);
      return updated;
    });
  };

  const playSong = (index: number, newQueue: Song[]) => {
    setOriginalQueue(newQueue);
    if (isShuffle) {
      const shuffled = [...newQueue].sort(() => Math.random() - 0.5);
      const songToPlay = newQueue[index];
      const sIndex = shuffled.findIndex(s => s.uri === songToPlay.uri);
      if (sIndex > -1) {
        shuffled.splice(sIndex, 1);
        shuffled.unshift(songToPlay);
      }
      setQueue(shuffled);
      setCurrentIndex(0);
    } else {
      setQueue(newQueue);
      setCurrentIndex(index);
    }
  };

  const togglePlayPause = () => {
    if (!currentSong || !player) return;
    if (status.playing) player.pause();
    else player.play();
  };

  const nextSong = () => {
    if (queue.length === 0) return;
    setCurrentIndex(prev => (prev === queue.length - 1 ? 0 : prev + 1));
  };

  const prevSong = () => {
    if (queue.length === 0) return;
    setCurrentIndex(prev => (prev === 0 ? queue.length - 1 : prev - 1));
  };

  const seek = async (value: number) => {
    if (player) await player.seekTo(value);
  };

  const toggleLoop = () => setIsLooping(!isLooping);

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const newShuffle = !prev;
      if (newShuffle && queue.length > 0 && currentSong) {
        const remaining = queue.filter(s => s.uri !== currentSong.uri);
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        setQueue([currentSong, ...shuffled]);
        setCurrentIndex(0);
      } else if (!newShuffle && originalQueue.length > 0 && currentSong) {
        setQueue(originalQueue);
        const oIndex = originalQueue.findIndex(s => s.uri === currentSong.uri);
        setCurrentIndex(oIndex > -1 ? oIndex : 0);
      }
      return newShuffle;
    });
  };

  return (
    <AudioContext.Provider
      value={{
        library, favorites, recentlyPlayed, playlists, currentSong, currentIndex, queue, player, status, isLooping, isShuffle,
        addSongsToLibrary, removeSongFromLibrary, toggleFavorite, isFavorite, createPlaylist, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist,
        playSong, togglePlayPause, nextSong, prevSong, toggleLoop, toggleShuffle, seek
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudioContext must be used within AudioProvider");
  return ctx;
}
