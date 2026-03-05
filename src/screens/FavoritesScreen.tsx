import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { ToolCard } from '../components/ToolCard';
import { TOOLS } from '../utils/tools';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FavoritesScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { favorites, addRecentTool } = useAppStore();

    const handleToolPress = (toolId: keyof RootStackParamList) => {
        addRecentTool(toolId as string);
        navigation.navigate(toolId);
    };

    const favoriteTools = favorites
        .map(id => TOOLS.find(t => t.id === id))
        .filter(Boolean) as typeof TOOLS;

    return (
        <ScreenWrapper scrollable={false}>
            {favoriteTools.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
                        No favorite tools yet.
                    </Text>
                    <Text variant="bodyMedium" style={{ textAlign: 'center', marginTop: 8, opacity: 0.7 }}>
                        Tap the heart icon on any tool screen to add it here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favoriteTools}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <ToolCard
                            title={item.name}
                            icon={item.icon}
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
});
