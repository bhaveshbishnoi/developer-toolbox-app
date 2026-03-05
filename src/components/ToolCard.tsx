import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ToolCardProps {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, icon, onPress }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <MaterialCommunityIcons name={icon} size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.title} variant="titleMedium" numberOfLines={2}>
                    {title}
                </Text>
            </Surface>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '47%',
        aspectRatio: 1,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
