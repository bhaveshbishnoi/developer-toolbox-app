import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, Surface, IconButton, Dialog, Portal, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAppStore, ToolHistoryItem } from '../store';
import { TOOLS } from '../utils/tools';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HistoryScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { history, deleteHistoryItem, clearHistory } = useAppStore();
    const [confirmClear, setConfirmClear] = useState(false);

    const handleRestoreItem = (item: ToolHistoryItem) => {
        navigation.navigate(item.toolId as any, { initialInput: item.input });
    };

    const handleCopyOutput = async (output: string) => {
        if (output) {
            await Clipboard.setStringAsync(output);
            Alert.alert('Copied', 'History output copied to clipboard');
        }
    };

    return (
        <ScreenWrapper scrollable={false}>
            <View style={styles.header}>
                <View>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        Activity Log
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {history.length} stored records (Tap to re-open with input)
                    </Text>
                </View>

                {history.length > 0 && (
                    <IconButton
                        icon="trash-can-outline"
                        iconColor={theme.colors.error}
                        onPress={() => setConfirmClear(true)}
                    />
                )}
            </View>

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="history" size={54} color={theme.colors.onSurfaceVariant} />
                    <Text variant="titleMedium" style={{ marginTop: 12, fontWeight: 'bold' }}>
                        No history records yet
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
                        Your transformations, decodings, and API requests will appear here automatically.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    renderItem={({ item }) => {
                        const tool = TOOLS.find((t) => t.id === item.toolId);
                        const date = new Date(item.timestamp).toLocaleString();

                        return (
                            <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleRestoreItem(item)}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.toolTitleRow}>
                                            <MaterialCommunityIcons
                                                name={tool?.icon || 'toolbox'}
                                                size={18}
                                                color={theme.colors.primary}
                                                style={{ marginRight: 6 }}
                                            />
                                            <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                                {tool?.name || item.toolName}
                                            </Text>
                                        </View>
                                        <View style={styles.cardActions}>
                                            <IconButton
                                                icon="content-copy"
                                                size={16}
                                                onPress={() => handleCopyOutput(item.output)}
                                                style={styles.miniBtn}
                                            />
                                            <IconButton
                                                icon="close"
                                                size={16}
                                                onPress={() => deleteHistoryItem(item.id)}
                                                style={styles.miniBtn}
                                            />
                                        </View>
                                    </View>

                                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                                        {date}
                                    </Text>

                                    <View style={[styles.snippetContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <Text numberOfLines={1} style={[styles.snippet, { color: theme.colors.onSurface }]}>
                                            <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>IN: </Text>
                                            {item.input || 'None'}
                                        </Text>
                                        <Text numberOfLines={1} style={[styles.snippet, { color: theme.colors.onSurface }]}>
                                            <Text style={{ fontWeight: 'bold', color: theme.colors.tertiary }}>OUT: </Text>
                                            {item.output || 'None'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </Surface>
                        );
                    }}
                />
            )}

            {/* Clear History Confirmation Dialog */}
            <Portal>
                <Dialog visible={confirmClear} onDismiss={() => setConfirmClear(false)}>
                    <Dialog.Title>Clear All Activity?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Are you sure you want to clear your local history log? This action cannot be undone.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setConfirmClear(false)}>Cancel</Button>
                        <Button
                            textColor={theme.colors.error}
                            onPress={() => {
                                clearHistory();
                                setConfirmClear(false);
                            }}
                        >
                            Clear
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    card: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toolTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardActions: {
        flexDirection: 'row',
    },
    miniBtn: {
        margin: 0,
        width: 28,
        height: 28,
    },
    snippetContainer: {
        padding: 8,
        borderRadius: 8,
        gap: 4,
    },
    snippet: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
});
