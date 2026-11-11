import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, AppState, AppStateStatus } from 'react-native';
import { Text, Surface, Button, Chip, useTheme, ProgressBar, IconButton } from 'react-native-paper';
import { Accelerometer, Gyroscope, Magnetometer, Barometer, LightSensor } from 'expo-sensors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { PrivacyNote } from '../components/PrivacyNote';

type SensorType = 'accelerometer' | 'gyroscope' | 'magnetometer' | 'barometer' | 'light';

interface SensorInfo {
    id: SensorType;
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    unit: string;
    description: string;
    notes: string;
}

const SENSORS: SensorInfo[] = [
    {
        id: 'accelerometer',
        name: 'Accelerometer',
        icon: 'axis-arrow',
        unit: 'm/s²',
        description: 'Measures 3-axis acceleration forces acting on device',
        notes: 'Includes Earth gravity (~9.8 m/s²). X = lateral, Y = longitudinal, Z = perpendicular to screen.',
    },
    {
        id: 'gyroscope',
        name: 'Gyroscope',
        icon: 'rotate-3d-variant',
        unit: 'rad/s',
        description: 'Measures device rotation rate around 3 axes',
        notes: 'Reports angular velocity in radians per second, not absolute orientation.',
    },
    {
        id: 'magnetometer',
        name: 'Magnetometer',
        icon: 'compass-outline',
        unit: 'µT',
        description: 'Measures ambient geomagnetic field in microteslas',
        notes: 'Readings are sensitive to nearby metals and magnetic fields. Wave phone in figure-8 to calibrate.',
    },
    {
        id: 'barometer',
        name: 'Barometer',
        icon: 'gauge',
        unit: 'hPa',
        description: 'Measures atmospheric air pressure',
        notes: 'Useful for detecting elevation changes. 1 hPa = 1 mbar. Not available on all devices.',
    },
    {
        id: 'light',
        name: 'Ambient Light',
        icon: 'white-balance-sunny',
        unit: 'lux',
        description: 'Measures ambient illuminance level',
        notes: 'Reports light intensity hitting the front-facing sensor. Not available on all devices.',
    },
];

export const SensorTester = () => {
    const theme = useTheme();
    const route = useRoute<any>();
    const initialSensor = (route.params?.initialSensor as SensorType) || 'accelerometer';

    const [selectedSensor, setSelectedSensor] = useState<SensorType>(initialSensor);
    const [availability, setAvailability] = useState<Record<SensorType, boolean>>({
        accelerometer: true,
        gyroscope: true,
        magnetometer: true,
        barometer: false,
        light: false,
    });
    const [isRunning, setIsRunning] = useState(false);
    const [readings, setReadings] = useState<{ x?: number; y?: number; z?: number; value?: number }>({});
    const subscriptionRef = useRef<any>(null);

    // Check hardware availability on mount
    useEffect(() => {
        let isMounted = true;
        const checkSensors = async () => {
            const [accelAvail, gyroAvail, magAvail, baroAvail, lightAvail] = await Promise.all([
                Accelerometer.isAvailableAsync().catch(() => false),
                Gyroscope.isAvailableAsync().catch(() => false),
                Magnetometer.isAvailableAsync().catch(() => false),
                Barometer.isAvailableAsync().catch(() => false),
                LightSensor.isAvailableAsync().catch(() => false),
            ]);

            if (isMounted) {
                setAvailability({
                    accelerometer: accelAvail,
                    gyroscope: gyroAvail,
                    magnetometer: magAvail,
                    barometer: baroAvail,
                    light: lightAvail,
                });
            }
        };

        checkSensors();
        return () => {
            isMounted = false;
        };
    }, []);

    // Stop listener when app is backgrounded
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState.match(/inactive|background/)) {
                stopSensor();
            }
        };

        const sub = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            sub.remove();
            stopSensor();
        };
    }, [selectedSensor]);

    const stopSensor = () => {
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
            subscriptionRef.current = null;
        }
        setIsRunning(false);
    };

    const startSensor = (sensor: SensorType) => {
        stopSensor();
        setIsRunning(true);
        setReadings({});

        // Set conservative update interval (100ms) to prevent UI overload
        const updateInterval = 100;

        try {
            switch (sensor) {
                case 'accelerometer':
                    Accelerometer.setUpdateInterval(updateInterval);
                    subscriptionRef.current = Accelerometer.addListener((data) => {
                        // Convert g-force to m/s^2 (1g = 9.80665 m/s^2)
                        setReadings({
                            x: data.x * 9.80665,
                            y: data.y * 9.80665,
                            z: data.z * 9.80665,
                        });
                    });
                    break;
                case 'gyroscope':
                    Gyroscope.setUpdateInterval(updateInterval);
                    subscriptionRef.current = Gyroscope.addListener((data) => {
                        setReadings({
                            x: data.x,
                            y: data.y,
                            z: data.z,
                        });
                    });
                    break;
                case 'magnetometer':
                    Magnetometer.setUpdateInterval(updateInterval);
                    subscriptionRef.current = Magnetometer.addListener((data) => {
                        setReadings({
                            x: data.x,
                            y: data.y,
                            z: data.z,
                        });
                    });
                    break;
                case 'barometer':
                    Barometer.setUpdateInterval(updateInterval);
                    subscriptionRef.current = Barometer.addListener((data) => {
                        setReadings({
                            value: data.pressure,
                        });
                    });
                    break;
                case 'light':
                    LightSensor.setUpdateInterval(updateInterval);
                    subscriptionRef.current = LightSensor.addListener((data) => {
                        setReadings({
                            value: data.illuminance,
                        });
                    });
                    break;
            }
        } catch (e) {
            console.error('Error starting sensor listener', e);
            setIsRunning(false);
        }
    };

    const handleSelectSensor = (sensor: SensorType) => {
        stopSensor();
        setSelectedSensor(sensor);
        setReadings({});
    };

    const currentSensor = SENSORS.find((s) => s.id === selectedSensor)!;
    const isAvail = availability[selectedSensor];

    // Compute compass azimuth if magnetometer
    let compassHeading: number | null = null;
    if (selectedSensor === 'magnetometer' && readings.x !== undefined && readings.y !== undefined) {
        let angle = Math.atan2(readings.y, readings.x) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        compassHeading = Math.round(angle);
    }

    const renderAxisBar = (axis: string, val: number | undefined, maxLimit: number, color: string) => {
        const num = val ?? 0;
        const progress = Math.min(Math.abs(num) / maxLimit, 1);
        return (
            <View style={styles.axisContainer} key={axis}>
                <View style={styles.axisHeader}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', color }}>
                        Axis {axis}
                    </Text>
                    <Text variant="bodyMedium" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {num.toFixed(3)} {currentSensor.unit}
                    </Text>
                </View>
                <ProgressBar progress={progress} color={color} style={styles.progressBar} />
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <PrivacyNote note="Reads live hardware sensors locally during active testing. Sensor streams stop immediately when you leave this screen." />

            {/* Sensor Selection Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {SENSORS.map((s) => {
                    const isSelected = selectedSensor === s.id;
                    const available = availability[s.id];
                    return (
                        <Chip
                            key={s.id}
                            selected={isSelected}
                            onPress={() => handleSelectSensor(s.id)}
                            style={[
                                styles.sensorChip,
                                isSelected && { backgroundColor: theme.colors.primaryContainer },
                            ]}
                            textStyle={{
                                color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                                fontWeight: isSelected ? '700' : '400',
                            }}
                            icon={() => (
                                <MaterialCommunityIcons
                                    name={s.icon}
                                    size={16}
                                    color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                />
                            )}
                        >
                            {s.name} {!available ? '✗' : ''}
                        </Chip>
                    );
                })}
            </ScrollView>

            {/* Main Sensor Panel */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <MaterialCommunityIcons name={currentSensor.icon} size={26} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            {currentSensor.name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {currentSensor.description}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: isAvail ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
                        ]}
                    >
                        <Text
                            style={{
                                color: isAvail ? theme.colors.tertiary : theme.colors.error,
                                fontSize: 11,
                                fontWeight: '700',
                            }}
                        >
                            {isAvail ? 'Available' : 'Not available'}
                        </Text>
                    </View>
                </View>

                {!isAvail ? (
                    <View style={styles.unavailableContainer}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={36} color={theme.colors.error} />
                        <Text variant="bodyMedium" style={[styles.unavailableText, { color: theme.colors.onSurfaceVariant }]}>
                            {currentSensor.name} is not reported on this device hardware or restricted by the platform.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Control Buttons */}
                        <View style={styles.buttonRow}>
                            <Button
                                mode="contained"
                                icon={isRunning ? 'pause' : 'play'}
                                onPress={() => (isRunning ? stopSensor() : startSensor(selectedSensor))}
                                style={[styles.actionBtn, isRunning && { backgroundColor: theme.colors.secondary }]}
                            >
                                {isRunning ? 'Pause' : 'Start Reading'}
                            </Button>
                            <Button
                                mode="outlined"
                                icon="stop"
                                onPress={stopSensor}
                                disabled={!isRunning}
                                style={styles.actionBtn}
                            >
                                Stop
                            </Button>
                        </View>

                        {/* Live Values Display */}
                        {selectedSensor === 'barometer' || selectedSensor === 'light' ? (
                            <View style={styles.singleValueBox}>
                                <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    {readings.value !== undefined ? readings.value.toFixed(2) : '---'}
                                </Text>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {currentSensor.unit}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.axisList}>
                                {renderAxisBar('X', readings.x, selectedSensor === 'accelerometer' ? 20 : 10, '#38BDF8')}
                                {renderAxisBar('Y', readings.y, selectedSensor === 'accelerometer' ? 20 : 10, '#818CF8')}
                                {renderAxisBar('Z', readings.z, selectedSensor === 'accelerometer' ? 20 : 10, '#34D399')}
                            </View>
                        )}

                        {/* Compass Azimuth if Magnetometer */}
                        {compassHeading !== null && (
                            <View style={styles.headingBox}>
                                <MaterialCommunityIcons name="compass" size={24} color={theme.colors.primary} />
                                <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginLeft: 8 }}>
                                    Estimated Azimuth: {compassHeading}°
                                </Text>
                            </View>
                        )}

                        {/* Explanatory notes */}
                        <View style={[styles.notesBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.onSurfaceVariant} style={{ marginRight: 6 }} />
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
                                {currentSensor.notes}
                            </Text>
                        </View>
                    </>
                )}
            </Surface>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    chipsScroll: {
        marginBottom: 16,
    },
    sensorChip: {
        marginRight: 8,
        height: 38,
    },
    card: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    unavailableContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unavailableText: {
        marginTop: 10,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    actionBtn: {
        flex: 1,
    },
    axisList: {
        marginBottom: 16,
    },
    axisContainer: {
        marginBottom: 12,
    },
    axisHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    singleValueBox: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
    },
    notesBox: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 8,
        alignItems: 'flex-start',
    },
});

