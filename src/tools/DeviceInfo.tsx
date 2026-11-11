import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Share, Dimensions, Platform } from 'react-native';
import { Text, Surface, Button, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { PrivacyNote } from '../components/PrivacyNote';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DeviceReport {
    // Identity
    brand: string;
    manufacturer: string;
    modelName: string;
    designName: string;
    productName: string;
    osName: string;
    osVersion: string;
    apiLevel: string;
    deviceType: string;
    // CPU
    supportedCpuArchitectures: string[];
    primaryCpuArch: string;
    processorCount: string;
    // Memory & Storage
    totalMemory: string;
    storageTotal: string;
    storageFree: string;
    storageUsed: string;
    // Display
    screenWidth: number;
    screenHeight: number;
    screenScale: number;
    screenFontScale: number;
    // Battery
    batteryLevel: string;
    batteryState: string;
    isCharging: boolean;
}

export const DeviceInfo = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<DeviceReport | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const formatBytes = (bytes: number): string => {
        if (!bytes || bytes <= 0) return 'Not reported';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
    };

    const loadDeviceInfo = useCallback(async () => {
        setLoading(true);
        try {
            // Battery info
            let batteryLevelStr = 'Not reported';
            let batteryStateStr = 'Unknown';
            let charging = false;
            try {
                const level = await Battery.getBatteryLevelAsync();
                if (level !== -1) {
                    batteryLevelStr = `${Math.round(level * 100)}%`;
                }
                const bState = await Battery.getBatteryStateAsync();
                switch (bState) {
                    case Battery.BatteryState.CHARGING:
                        batteryStateStr = 'Charging';
                        charging = true;
                        break;
                    case Battery.BatteryState.FULL:
                        batteryStateStr = 'Full (Plugged In)';
                        charging = true;
                        break;
                    case Battery.BatteryState.UNPLUGGED:
                        batteryStateStr = 'Discharging (Unplugged)';
                        break;
                    default:
                        batteryStateStr = 'Unknown';
                }
            } catch {
                batteryLevelStr = 'Not reported';
            }

            // Storage info
            let totalStorageStr = 'Not reported';
            let freeStorageStr = 'Not reported';
            let usedStorageStr = 'Not reported';
            try {
                const freeDisk = await FileSystem.getFreeDiskStorageAsync();
                const totalDisk = await FileSystem.getTotalDiskCapacityAsync();
                if (totalDisk > 0) {
                    totalStorageStr = formatBytes(totalDisk);
                    freeStorageStr = formatBytes(freeDisk);
                    const used = totalDisk - freeDisk;
                    usedStorageStr = formatBytes(used > 0 ? used : 0);
                }
            } catch {
                // Storage access restricted or not exposed
            }

            // Display info
            const window = Dimensions.get('window');

            // Device type
            let devType = 'Phone / Unknown';
            switch (Device.deviceType) {
                case Device.DeviceType.PHONE:
                    devType = 'Handset / Phone';
                    break;
                case Device.DeviceType.TABLET:
                    devType = 'Tablet';
                    break;
                case Device.DeviceType.DESKTOP:
                    devType = 'Desktop';
                    break;
                case Device.DeviceType.TV:
                    devType = 'Television';
                    break;
            }

            // RAM info
            const totalMem = Device.totalMemory ? formatBytes(Device.totalMemory) : 'Not reported by OS';

            setReport({
                brand: Device.brand || 'Not reported',
                manufacturer: Device.manufacturer || 'Not reported',
                modelName: Device.modelName || 'Not reported',
                designName: Device.designName || 'Not reported',
                productName: Device.productName || 'Not reported',
                osName: Device.osName || 'Android',
                osVersion: Device.osVersion || 'Unknown',
                apiLevel: Device.platformApiLevel ? String(Device.platformApiLevel) : 'Not reported',
                deviceType: devType,
                supportedCpuArchitectures: Device.supportedCpuArchitectures || ['arm64-v8a'],
                primaryCpuArch: Device.supportedCpuArchitectures?.[0] || 'arm64-v8a',
                processorCount: 'Multi-core (OS managed)',
                totalMemory: totalMem,
                storageTotal: totalStorageStr,
                storageFree: freeStorageStr,
                storageUsed: usedStorageStr,
                screenWidth: Math.round(window.width * window.scale),
                screenHeight: Math.round(window.height * window.scale),
                screenScale: window.scale,
                screenFontScale: window.fontScale,
                batteryLevel: batteryLevelStr,
                batteryState: batteryStateStr,
                isCharging: charging,
            });
        } catch (e) {
            console.error('Error loading device information', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDeviceInfo();
    }, [loadDeviceInfo]);

    const buildTextReport = (): string => {
        if (!report) return '';
        return `--- DEVELOPER TOOLBOX DEVICE REPORT ---
Generated: ${new Date().toLocaleString()}

[DEVICE IDENTITY]
Brand: ${report.brand}
Manufacturer: ${report.manufacturer}
Model: ${report.modelName}
Device Product / Codename: ${report.productName}
OS: ${report.osName} ${report.osVersion}
API Level: ${report.apiLevel}
Form Factor: ${report.deviceType}

[CPU & ARCHITECTURE]
Primary ABI: ${report.primaryCpuArch}
Supported ABIs: ${report.supportedCpuArchitectures.join(', ')}

[MEMORY & STORAGE]
System RAM: ${report.totalMemory}
Internal Storage Total: ${report.storageTotal}
Internal Storage Available: ${report.storageFree}
Internal Storage Used: ${report.storageUsed}

[DISPLAY METRICS]
Resolution: ${report.screenWidth} x ${report.screenHeight} px
Window Density Scale: ${report.screenScale}x
Font Scale: ${report.screenFontScale}x

[BATTERY]
Level: ${report.batteryLevel}
State: ${report.batteryState}
---------------------------------------`;
    };

    const handleCopyAll = async () => {
        const text = buildTextReport();
        if (text) {
            await Clipboard.setStringAsync(text);
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 2000);
        }
    };

    const handleShare = async () => {
        const text = buildTextReport();
        if (text) {
            try {
                await Share.share({
                    title: 'Android Device Technical Profile',
                    message: text,
                });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const renderRow = (label: string, value: string, subtitle?: string) => (
        <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
                <Text variant="bodyMedium" style={styles.rowLabel}>
                    {label}
                </Text>
                {subtitle && (
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {subtitle}
                    </Text>
                )}
            </View>
            <Text
                selectable
                variant="bodyMedium"
                style={[
                    styles.rowValue,
                    {
                        color: value.includes('Not reported') ? theme.colors.onSurfaceVariant : theme.colors.onSurface,
                    },
                ]}
            >
                {value}
            </Text>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.topActions}>
                <Button
                    mode="contained"
                    icon={copiedAll ? 'check' : 'content-copy'}
                    onPress={handleCopyAll}
                    style={styles.actionButton}
                >
                    {copiedAll ? 'Copied' : 'Copy Report'}
                </Button>
                <Button
                    mode="outlined"
                    icon="share-variant-outline"
                    onPress={handleShare}
                    style={styles.actionButton}
                >
                    Share
                </Button>
                <IconButton
                    icon="refresh"
                    size={22}
                    iconColor={theme.colors.primary}
                    onPress={loadDeviceInfo}
                />
            </View>

            <PrivacyNote note="Reads system-reported hardware properties locally. Never uploads device profiles or identifiers." />

            {loading || !report ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
                        Reading device specifications...
                    </Text>
                </View>
            ) : (
                <>
                    {/* Header Summary Card */}
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
                        <View style={styles.summaryRow}>
                            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                                <MaterialCommunityIcons name="cellphone-check" size={32} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                    {report.brand} {report.modelName}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Android {report.osVersion} • API {report.apiLevel} • {report.deviceType}
                                </Text>
                            </View>
                        </View>
                    </Surface>

                    {/* Section 1: Device Identity */}
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="shield-account-outline" size={20} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={styles.cardTitle}>
                                Device Identity
                            </Text>
                        </View>
                        {renderRow('Manufacturer', report.manufacturer)}
                        {renderRow('Brand', report.brand)}
                        {renderRow('Model Name', report.modelName)}
                        {renderRow('Codename / Product', report.productName)}
                        {renderRow('OS Release', `${report.osName} ${report.osVersion}`)}
                        {renderRow('Android API Level', report.apiLevel)}
                        {renderRow('Form Factor', report.deviceType)}
                    </Surface>

                    {/* Section 2: CPU & Architecture */}
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="cpu-64-bit" size={20} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={styles.cardTitle}>
                                CPU & Architecture
                            </Text>
                        </View>
                        {renderRow('Primary ABI', report.primaryCpuArch)}
                        {renderRow('Supported ABIs', report.supportedCpuArchitectures.join(', '))}
                        {renderRow('Processor Topology', report.processorCount, 'Kernel managed')}
                    </Surface>

                    {/* Section 3: Memory & Storage */}
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="memory" size={20} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={styles.cardTitle}>
                                Memory & Storage
                            </Text>
                        </View>
                        {renderRow('Total System RAM', report.totalMemory, 'System reported')}
                        {renderRow('Internal Storage Total', report.storageTotal, 'Filesystem reported')}
                        {renderRow('Storage Available', report.storageFree)}
                        {renderRow('Storage Used', report.storageUsed)}
                    </Surface>

                    {/* Section 4: Display Metrics */}
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="monitor-screenshot" size={20} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={styles.cardTitle}>
                                Display Metrics
                            </Text>
                        </View>
                        {renderRow('Pixel Dimensions', `${report.screenWidth} × ${report.screenHeight} px`)}
                        {renderRow('Window Density Scale', `${report.screenScale}x`)}
                        {renderRow('System Font Scale', `${report.screenFontScale}x`)}
                    </Surface>

                    {/* Section 5: Battery & Power */}
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons
                                name={report.isCharging ? 'battery-charging' : 'battery-high'}
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text variant="titleSmall" style={styles.cardTitle}>
                                Battery Status
                            </Text>
                        </View>
                        {renderRow('Battery Level', report.batteryLevel)}
                        {renderRow('Power State', report.batteryState)}
                    </Surface>

                    {/* Section 6: Sensors link */}
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="axis-arrow" size={20} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={styles.cardTitle}>
                                Sensor Hardware
                            </Text>
                        </View>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                            Test real-time accelerometer, gyroscope, magnetometer, barometer, and proximity sensors.
                        </Text>
                        <Button
                            mode="contained-tonal"
                            icon="arrow-right"
                            contentStyle={{ flexDirection: 'row-reverse' }}
                            onPress={() => navigation.navigate('SensorTester')}
                        >
                            Open Live Sensor Tester
                        </Button>
                    </Surface>
                </>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    topActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionButton: {
        flex: 1,
        marginRight: 8,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        paddingBottom: 8,
        gap: 8,
    },
    cardTitle: {
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
    },
    rowLabelContainer: {
        flex: 1,
    },
    rowLabel: {
        fontWeight: '500',
    },
    rowValue: {
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 8,
    },
});

