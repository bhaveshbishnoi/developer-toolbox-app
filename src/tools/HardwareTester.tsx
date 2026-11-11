import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Vibration, AppState, AppStateStatus, Platform } from 'react-native';
import { Text, Surface, Button, IconButton, useTheme, ProgressBar } from 'react-native-paper';
import { Camera, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { PrivacyNote } from '../components/PrivacyNote';

type TestMode = 'menu' | 'touch' | 'multitouch' | 'display' | 'vibration' | 'torch' | 'speaker' | 'mic';

export const HardwareTester = () => {
    const theme = useTheme();
    const [currentTest, setCurrentTest] = useState<TestMode>('menu');

    // --- Touch Test State ---
    const [touchPoints, setTouchPoints] = useState<{ id: string; x: number; y: number }[]>([]);
    const [touchCount, setTouchCount] = useState(0);
    const [maxTouches, setMaxTouches] = useState(0);

    // --- Display Test State ---
    const displayColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000', '#808080'];
    const displayColorNames = ['Pure Red', 'Pure Green', 'Pure Blue', 'Pure White', 'Pure Black', 'Neutral Gray'];
    const [displayColorIndex, setDisplayColorIndex] = useState(0);

    // --- Vibration State ---
    const [isVibrating, setIsVibrating] = useState(false);

    // --- Torch State ---
    const [torchOn, setTorchOn] = useState(false);

    // --- Speaker State ---
    const [soundPlaying, setSoundPlaying] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);

    // --- Microphone State ---
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [micPermission, setMicPermission] = useState<boolean | null>(null);
    const [audioMetering, setAudioMetering] = useState<number>(0);
    const [recordedUri, setRecordedUri] = useState<string | null>(null);
    const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);

    // Stop all hardware tests when app backgrounded or navigating away
    const cleanupAllHardware = async () => {
        // Stop vibration
        Vibration.cancel();
        setIsVibrating(false);

        // Stop torch
        setTorchOn(false);

        // Stop audio sound
        if (soundRef.current) {
            try {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
            } catch {}
            soundRef.current = null;
        }
        setSoundPlaying(false);

        // Stop recording
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
            } catch {}
            setRecording(null);
        }

        // Stop playback sound and delete temp recording
        if (playbackSound) {
            try {
                await playbackSound.stopAsync();
                await playbackSound.unloadAsync();
            } catch {}
            setPlaybackSound(null);
        }

        if (recordedUri) {
            try {
                await FileSystem.deleteAsync(recordedUri, { idempotent: true });
            } catch {}
            setRecordedUri(null);
        }
    };

    useEffect(() => {
        const handleAppState = (state: AppStateStatus) => {
            if (state.match(/inactive|background/)) {
                cleanupAllHardware();
            }
        };
        const sub = AppState.addEventListener('change', handleAppState);
        return () => {
            sub.remove();
            cleanupAllHardware();
        };
    }, []);

    // --- Vibration Handlers ---
    const triggerVibration = (pattern: number | number[]) => {
        Vibration.cancel();
        Vibration.vibrate(pattern);
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), Array.isArray(pattern) ? 1000 : (pattern as number));
    };

    const stopVibration = () => {
        Vibration.cancel();
        setIsVibrating(false);
    };

    // --- Speaker Tone Handlers ---
    const playTestTone = async () => {
        if (soundPlaying) {
            if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
            setSoundPlaying(false);
            return;
        }

        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
            });

            // Use bundled or synthetic beep sound via audio URI
            const { sound } = await Audio.Sound.createAsync(
                { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
                { shouldPlay: true, volume: 0.5 }
            );
            soundRef.current = sound;
            setSoundPlaying(true);
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setSoundPlaying(false);
                }
            });
        } catch {
            setSoundPlaying(false);
        }
    };

    // --- Microphone Handlers ---
    const startMicRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            setMicPermission(granted);
            if (!granted) return;

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync({
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                    audioEncoder: Audio.AndroidAudioEncoder.AAC,
                    sampleRate: 44100,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    audioQuality: Audio.IOSAudioQuality.HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 1,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {},
            });

            newRecording.setOnRecordingStatusUpdate((status) => {
                if (status.metering !== undefined) {
                    // Metering typically runs from -160 dB to 0 dB
                    const normalized = Math.min(Math.max((status.metering + 60) / 60, 0), 1);
                    setAudioMetering(normalized);
                }
            });

            await newRecording.startAsync();
            setRecording(newRecording);
        } catch (e) {
            console.error('Failed to start recording', e);
        }
    };

    const stopMicRecording = async () => {
        if (!recording) return;
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecordedUri(uri);
            setRecording(null);
            setAudioMetering(0);
        } catch (e) {
            console.error('Failed to stop recording', e);
        }
    };

    const playBackMicSample = async () => {
        if (!recordedUri) return;
        try {
            if (playbackSound) {
                await playbackSound.unloadAsync();
            }
            const { sound } = await Audio.Sound.createAsync(
                { uri: recordedUri },
                { shouldPlay: true }
            );
            setPlaybackSound(sound);
        } catch (e) {
            console.error('Failed to play back recording', e);
        }
    };

    return (
        <ScreenWrapper>
            <PrivacyNote note="All hardware diagnostic tests are strictly user-initiated. Audio, vibration, flashlight, and microphone stop immediately when leaving the test." />

            {/* Hidden CameraView for Torch Control */}
            <CameraView
                enableTorch={torchOn}
                style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }}
            />

            {/* Test 1: Touchscreen Canvas */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="gesture-tap" size={24} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            Touch & Multi-Touch Tester
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Verify panel sensitivity, multi-finger tracking, and dead zones.
                        </Text>
                    </View>
                </View>
                <View style={styles.btnRow}>
                    <Button
                        mode="contained"
                        icon="hand-back-right-outline"
                        onPress={() => setCurrentTest('touch')}
                        style={{ flex: 1, marginRight: 8 }}
                    >
                        Single Touch
                    </Button>
                    <Button
                        mode="contained-tonal"
                        icon="gesture-two-double-tap"
                        onPress={() => setCurrentTest('multitouch')}
                        style={{ flex: 1 }}
                    >
                        Multi-Touch
                    </Button>
                </View>
            </Surface>

            {/* Test 2: Display Color Inspection */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="monitor-shimmer" size={24} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            Display Color & Sub-pixel Test
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Inspect screen with full-screen pure RGB, white, black, and gray fields.
                        </Text>
                    </View>
                </View>
                <Button
                    mode="contained"
                    icon="palette"
                    onPress={() => setCurrentTest('display')}
                >
                    Start Screen Color Test
                </Button>
            </Surface>

            {/* Test 3: Vibration Engine */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="vibrate" size={24} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            Vibration Motor Tester
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Test haptic engine with standard pulses and custom durations.
                        </Text>
                    </View>
                </View>
                <View style={styles.gridBtns}>
                    <Button mode="contained-tonal" onPress={() => triggerVibration(200)} style={styles.gridBtn}>
                        Short (200ms)
                    </Button>
                    <Button mode="contained-tonal" onPress={() => triggerVibration(500)} style={styles.gridBtn}>
                        Medium (500ms)
                    </Button>
                    <Button mode="contained-tonal" onPress={() => triggerVibration([0, 150, 100, 150])} style={styles.gridBtn}>
                        Double Tap
                    </Button>
                    <Button mode="contained-tonal" onPress={() => triggerVibration([0, 100, 50, 200, 50, 100])} style={styles.gridBtn}>
                        Heartbeat
                    </Button>
                </View>
                {isVibrating && (
                    <Button mode="contained" buttonColor={theme.colors.error} icon="stop" onPress={stopVibration} style={{ marginTop: 8 }}>
                        Stop Vibration
                    </Button>
                )}
            </Surface>

            {/* Test 4: Flashlight / Torch */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="flashlight" size={24} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            Camera Flashlight / Torch
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Toggle device rear camera flash with automatic turn-off safety.
                        </Text>
                    </View>
                </View>
                <Button
                    mode={torchOn ? 'contained' : 'contained-tonal'}
                    buttonColor={torchOn ? '#F59E0B' : undefined}
                    icon={torchOn ? 'flashlight' : 'flashlight-off'}
                    onPress={() => setTorchOn(!torchOn)}
                >
                    {torchOn ? 'Turn Flashlight OFF' : 'Turn Flashlight ON'}
                </Button>
            </Surface>

            {/* Test 5: Speaker Output */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="volume-high" size={24} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            Speaker Output Test
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Plays a safe reference test tone at 50% volume to verify speaker channels.
                        </Text>
                    </View>
                </View>
                <Button
                    mode={soundPlaying ? 'contained' : 'contained-tonal'}
                    icon={soundPlaying ? 'stop' : 'play'}
                    onPress={playTestTone}
                >
                    {soundPlaying ? 'Stop Audio Sample' : 'Play Test Tone'}
                </Button>
            </Surface>

            {/* Test 6: Microphone Input */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="microphone" size={24} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            Microphone Input & Level Meter
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Records a brief local sample, visualizes audio levels, and verifies playback.
                        </Text>
                    </View>
                </View>

                {recording ? (
                    <View style={{ marginBottom: 12 }}>
                        <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                            Input Level Meter:
                        </Text>
                        <ProgressBar progress={audioMetering} color={theme.colors.primary} style={{ height: 10, borderRadius: 5 }} />
                        <Button
                            mode="contained"
                            buttonColor={theme.colors.error}
                            icon="stop"
                            onPress={stopMicRecording}
                            style={{ marginTop: 12 }}
                        >
                            Stop Recording
                        </Button>
                    </View>
                ) : (
                    <View style={styles.btnRow}>
                        <Button
                            mode="contained"
                            icon="record-rec"
                            onPress={startMicRecording}
                            style={{ flex: 1, marginRight: 8 }}
                        >
                            Record Sample
                        </Button>
                        {recordedUri && (
                            <Button
                                mode="contained-tonal"
                                icon="play"
                                onPress={playBackMicSample}
                                style={{ flex: 1 }}
                            >
                                Play Back
                            </Button>
                        )}
                    </View>
                )}
            </Surface>

            {/* FULL SCREEN MODAL: TOUCH CANVAS */}
            <Modal visible={currentTest === 'touch'} animationType="fade" transparent={false}>
                <View
                    style={[styles.fullScreenCanvas, { backgroundColor: '#090D16' }]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={(e) => {
                        const { locationX, locationY } = e.nativeEvent;
                        setTouchPoints((prev) => [...prev.slice(-40), { id: `${Date.now()}`, x: locationX, y: locationY }]);
                    }}
                    onResponderMove={(e) => {
                        const { locationX, locationY } = e.nativeEvent;
                        setTouchPoints((prev) => [...prev.slice(-40), { id: `${Date.now()}-${Math.random()}`, x: locationX, y: locationY }]);
                    }}
                >
                    {touchPoints.map((pt) => (
                        <View
                            key={pt.id}
                            style={[
                                styles.touchDot,
                                {
                                    left: pt.x - 18,
                                    top: pt.y - 18,
                                    backgroundColor: theme.colors.primary,
                                },
                            ]}
                        />
                    ))}

                    <View style={styles.modalTopBar}>
                        <Text style={styles.modalInfoText}>Tap or draw across screen to check touch grid</Text>
                        <View style={styles.modalActions}>
                            <Button mode="contained-tonal" compact onPress={() => setTouchPoints([])} style={{ marginRight: 8 }}>
                                Clear
                            </Button>
                            <Button mode="contained" compact onPress={() => setCurrentTest('menu')}>
                                Exit
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* FULL SCREEN MODAL: MULTI-TOUCH TEST */}
            <Modal visible={currentTest === 'multitouch'} animationType="fade" transparent={false}>
                <View
                    style={[styles.fullScreenCanvas, { backgroundColor: '#0F172A' }]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={(e) => {
                        const touches = e.nativeEvent.touches ? e.nativeEvent.touches.length : 1;
                        setTouchCount(touches);
                        setMaxTouches((prev) => Math.max(prev, touches));
                    }}
                    onResponderMove={(e) => {
                        const touches = e.nativeEvent.touches ? e.nativeEvent.touches.length : 1;
                        setTouchCount(touches);
                        setMaxTouches((prev) => Math.max(prev, touches));
                    }}
                    onResponderRelease={() => setTouchCount(0)}
                >
                    <View style={styles.centerBox}>
                        <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            {touchCount}
                        </Text>
                        <Text variant="titleMedium" style={{ color: '#F1F5F9', marginTop: 4 }}>
                            Active Touch Points
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#94A3B8', marginTop: 8 }}>
                            Maximum Observed: {maxTouches} fingers
                        </Text>
                    </View>

                    <View style={styles.modalTopBar}>
                        <Text style={styles.modalInfoText}>Place multiple fingers simultaneously</Text>
                        <Button mode="contained" compact onPress={() => setCurrentTest('menu')}>
                            Exit
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* FULL SCREEN MODAL: DISPLAY COLOR INSPECTION */}
            <Modal visible={currentTest === 'display'} animationType="fade" transparent={false}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.fullScreenCanvas, { backgroundColor: displayColors[displayColorIndex] }]}
                    onPress={() => setDisplayColorIndex((prev) => (prev + 1) % displayColors.length)}
                >
                    <View style={styles.displayColorOverlay}>
                        <Text style={[styles.colorNameText, { color: displayColors[displayColorIndex] === '#FFFFFF' ? '#000000' : '#FFFFFF' }]}>
                            {displayColorNames[displayColorIndex]} (Tap screen for next color)
                        </Text>
                        <Button
                            mode="contained"
                            compact
                            buttonColor="rgba(0,0,0,0.7)"
                            textColor="#FFFFFF"
                            onPress={() => setCurrentTest('menu')}
                        >
                            Exit Test
                        </Button>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    btnRow: {
        flexDirection: 'row',
    },
    gridBtns: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    gridBtn: {
        flexGrow: 1,
    },
    fullScreenCanvas: {
        flex: 1,
        position: 'relative',
    },
    touchDot: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 18,
        opacity: 0.8,
    },
    modalTopBar: {
        position: 'absolute',
        top: 40,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)',
        padding: 10,
        borderRadius: 10,
    },
    modalInfoText: {
        color: '#FFFFFF',
        fontSize: 12,
        flex: 1,
    },
    modalActions: {
        flexDirection: 'row',
    },
    centerBox: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    displayColorOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 10,
    },
    colorNameText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
});

