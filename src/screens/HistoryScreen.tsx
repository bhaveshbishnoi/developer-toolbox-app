import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAppStore } from '../store';
import { TOOLS } from '../utils/tools';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HistoryScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { history, deleteHistoryItem, clearHistory } = useAppStore();

    const handleHistoryPress = (toolId: string) => {
        navigation.navigate(toolId as keyof RootStackParamList);
        // Ideally we'd pass the input to the tool, but for simplicity we'll just navigate
    };

    return (
        <ScreenWrapper scrollable={false}>
            <View style={styles.header}>
                <Text variant="titleMedium">Recent Activity</Text>
                {history.length > 0 && (
                    <IconButton icon="trash-can-outline" onPress={clearHistory} />
                )}
            </View>

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge">No history yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const tool = TOOLS.find(t => t.id === item.toolId);
                        const date = new Date(item.timestamp).toLocaleString();

                        return (
                            <TouchableOpacity onPress={() => handleHistoryPress(item.toolId)}>
                                <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
                                    <View style={styles.cardHeader}>
                                        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                                            {tool?.name || 'Unknown Tool'}
                                        </Text>
                                        <IconButton
                                            icon="close"
                                            size={16}
                                            onPress={() => deleteHistoryItem(item.id)}
                                            style={styles.deleteBtn}
                                        />
                                    </View>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                                        {date}
                                    </Text>

                                    <View style={styles.snippetContainer}>
                                        <Text numberOfLines={1} variant="bodyMedium" style={styles.snippet}>
                                            In: {item.input || 'None'}
                                        </Text>
                                        <Text numberOfLines={1} variant="bodyMedium" style={styles.snippet}>
                                            Out: {item.output || 'None'}
                                        </Text>
                                    </View>
                                </Surface>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deleteBtn: {
        margin: 0,
    },
    snippetContainer: {
        marginTop: 4,
    },
    snippet: {
        fontFamily: 'monospace',
        opacity: 0.8,
    }
});
