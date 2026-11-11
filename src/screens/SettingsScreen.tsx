import React, { useState } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { Text, Surface, Button, Switch, useTheme, IconButton, Dialog, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAppStore } from '../store';

export const SettingsScreen = () => {
    const theme = useTheme();
    const { history, clearHistory, preferences, updatePreferences } = useAppStore();
    const [confirmClearDialog, setConfirmClearDialog] = useState(false);

    const handleConfirmClear = () => {
        clearHistory();
        setConfirmClearDialog(false);
        Alert.alert('History Cleared', 'All tool history items have been removed.');
    };

    return (
        <ScreenWrapper>
            {/* App Info Header */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.headerRow}>
                    <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                        <MaterialCommunityIcons name="toolbox" size={28} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            Developer Toolbox
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Version 1.0.0 (Release APK) • Android 14+ / SDK 35
                        </Text>
                    </View>
                </View>
            </Surface>

            {/* Storage & History Management */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons name="history" size={20} color={theme.colors.primary} />
                    <Text variant="titleSmall" style={styles.cardTitle}>
                        Data & History Management
                    </Text>
                </View>

                <View style={styles.settingRow}>
                    <View>
                        <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                            Activity History Items
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {history.length} records stored locally on this device
                        </Text>
                    </View>
                    <Button
                        mode="outlined"
                        textColor={theme.colors.error}
                        disabled={history.length === 0}
                        onPress={() => setConfirmClearDialog(true)}
                    >
                        Clear All
                    </Button>
                </View>
            </Surface>

            {/* Privacy & Principles Disclosures */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={20} color={theme.colors.tertiary} />
                    <Text variant="titleSmall" style={styles.cardTitle}>
                        Privacy & Engineering Principles
                    </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 19 }}>
                    • <Text style={{ fontWeight: 'bold' }}>Local-first:</Text> All transformations, hashes, QR codes, and hardware diagnostics execute on-device.{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>No telemetry or accounts:</Text> No background tracking, user IDs, or mandatory login.{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Least-privilege permissions:</Text> Permissions are requested contextually only when you access features that require them.
                </Text>
            </Surface>

            {/* Dialog for History Clear */}
            <Portal>
                <Dialog visible={confirmClearDialog} onDismiss={() => setConfirmClearDialog(false)}>
                    <Dialog.Title>Clear Activity History?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            This will permanently remove all {history.length} stored tool inputs and outputs.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setConfirmClearDialog(false)}>Cancel</Button>
                        <Button textColor={theme.colors.error} onPress={handleConfirmClear}>
                            Clear History
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    cardTitle: {
        fontWeight: 'bold',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
});

