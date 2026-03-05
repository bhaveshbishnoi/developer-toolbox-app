import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { ToolCard } from '../components/ToolCard';
import { TOOLS } from '../utils/tools';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const { recentTools, addRecentTool } = useAppStore();

    const handleToolPress = (toolId: keyof RootStackParamList) => {
        addRecentTool(toolId as string);
        navigation.navigate(toolId);
    };

    const filteredTools = TOOLS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const recentToolsData = recentTools
        .map(id => TOOLS.find(t => t.id === id))
        .filter(Boolean) as typeof TOOLS;

    return (
        <ScreenWrapper scrollable={false}>
            <Searchbar
                placeholder="Search tools..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
                inputStyle={{ color: theme.colors.onSurface }}
                iconColor={theme.colors.onSurfaceVariant}
            />

            {searchQuery.length === 0 && recentToolsData.length > 0 && (
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Recently Used</Text>
                    <View style={styles.recentContainer}>
                        {recentToolsData.map(tool => (
                            <ToolCard
                                key={`recent-${tool.id}`}
                                title={tool.name}
                                icon={tool.icon}
                                onPress={() => handleToolPress(tool.id)}
                            />
                        ))}
                    </View>
                </View>
            )}

            <Text variant="titleMedium" style={styles.sectionTitle}>
                {searchQuery.length > 0 ? 'Search Results' : 'All Tools'}
            </Text>

            <FlatList
                data={filteredTools}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <ToolCard
                        title={item.name}
                        icon={item.icon}
                        onPress={() => handleToolPress(item.id)}
                    />
                )}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    searchbar: {
        marginBottom: 20,
        borderRadius: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        fontWeight: 'bold',
    },
    recentContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    row: {
        justifyContent: 'space-between',
    },
    list: {
        paddingBottom: 20,
    }
});
