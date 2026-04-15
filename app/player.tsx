import { MaterialIcons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { HeaderTitle } from "@react-navigation/elements";
import { useAudioPlayer , useAudioPlayerStatus } from 'expo-audio';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
    StyleSheet,
    Text,
    TouchableOcapacity,
    View,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

type Song = {
    name: string;
    uri: string;
};

export default function PlayerScreen() {
    return (

    );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 12,
    },
    HeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    albumArtContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    albumArt: {
        width: 200,
        height: 200,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8},
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    songDetailsContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    songTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    trackNumber: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    progressContainer: {
        marginBottom: 32,
    },
    slider: {
        width: 100%,
        height: 40,
    },
    timeContainer: {
        flexDiraction: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 32,
    },
    controlButton: {
        padding: 12,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8},
        
    }
})