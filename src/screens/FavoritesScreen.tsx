import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { ToolCard } from '../components/ToolCard';
import { TOOLS } from '../utils/tools';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FavoritesScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { favorites, addRecentTool } = useAppStore();

    const handleToolPress = (toolId: keyof RootStackParamList) => {
        addRecentTool(toolId as string);
        navigation.navigate(toolId as any);
    };

    const favoriteTools = favorites
        .map((id) => TOOLS.find((t) => t.id === id))
        .filter(Boolean) as typeof TOOLS;

    return (
        <ScreenWrapper scrollable={false}>
            {favoriteTools.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="heart-outline" size={54} color={theme.colors.onSurfaceVariant} />
                    <Text variant="titleMedium" style={{ textAlign: 'center', marginTop: 12, fontWeight: 'bold' }}>
                        No favorite tools pinned yet
                    </Text>
                    <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 6, color: theme.colors.onSurfaceVariant, paddingHorizontal: 30 }}>
                        Tap the heart icon on any tool card or detail header to access your essential tools quickly.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favoriteTools}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <ToolCard
                            id={item.id}
                            title={item.name}
                            description={item.description}
                            icon={item.icon}
                            badge={item.badge}
                            onPress={() => handleToolPress(item.id)}
                        />
                    )}
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    row: {
        justifyContent: 'space-between',
    },
    list: {
        paddingBottom: 24,
    },
});
