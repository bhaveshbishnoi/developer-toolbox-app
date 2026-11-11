import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, Searchbar, useTheme, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { ToolCard } from '../components/ToolCard';
import { TOOLS, CATEGORIES, ToolCategory } from '../utils/tools';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

    const { recentTools, addRecentTool } = useAppStore();

    const handleToolPress = (toolId: keyof RootStackParamList) => {
        addRecentTool(toolId as string);
        navigation.navigate(toolId as any);
    };

    const filteredTools = TOOLS.filter((t) => {
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        if (!q) return matchesCategory;

        const matchesSearch =
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.keywords.some((k) => k.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
    });

    const recentToolsData = recentTools
        .map((id) => TOOLS.find((t) => t.id === id))
        .filter(Boolean) as typeof TOOLS;

    return (
        <ScreenWrapper scrollable={false}>
            {/* Search Input */}
            <Searchbar
                placeholder="Search 16 developer tools & diagnostics..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
                inputStyle={{ color: theme.colors.onSurface }}
                iconColor={theme.colors.primary}
            />

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <Chip
                            key={cat.id}
                            selected={isSelected}
                            onPress={() => setSelectedCategory(cat.id)}
                            style={[
                                styles.categoryChip,
                                isSelected && { backgroundColor: theme.colors.primaryContainer },
                            ]}
                            textStyle={{
                                color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                                fontWeight: isSelected ? '700' : '500',
                            }}
                        >
                            {cat.name}
                        </Chip>
                    );
                })}
            </ScrollView>

            {/* Recently Used Carousel */}
            {searchQuery.length === 0 && selectedCategory === 'all' && recentToolsData.length > 0 && (
                <View style={styles.recentSection}>
                    <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                        RECENTLY USED
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
                        {recentToolsData.map((tool) => (
                            <ToolCard
                                key={`recent-${tool.id}`}
                                id={tool.id}
                                title={tool.name}
                                icon={tool.icon}
                                badge={tool.badge}
                                compact
                                onPress={() => handleToolPress(tool.id)}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.listHeaderRow}>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                    {searchQuery.length > 0 ? `SEARCH RESULTS (${filteredTools.length})` : 'ALL TOOLS'}
                </Text>
            </View>

            {filteredTools.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                        No tools found matching "{searchQuery}"
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTools}
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
    searchbar: {
        marginBottom: 10,
        borderRadius: 12,
        height: 48,
    },
    categoriesScroll: {
        marginBottom: 12,
        maxHeight: 40,
    },
    categoryChip: {
        marginRight: 6,
        height: 34,
    },
    recentSection: {
        marginBottom: 14,
    },
    recentScroll: {
        flexDirection: 'row',
    },
    listHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    row: {
        justifyContent: 'space-between',
    },
    list: {
        paddingBottom: 24,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
