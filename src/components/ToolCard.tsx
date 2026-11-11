import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../store';

interface ToolCardProps {
    id: string;
    title: string;
    description?: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    badge?: string;
    onPress: () => void;
    compact?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
    id,
    title,
    description,
    icon,
    badge,
    onPress,
    compact = false,
}) => {
    const theme = useTheme();
    const { favorites, toggleFavorite } = useAppStore();
    const isFav = favorites.includes(id);

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={compact ? styles.compactContainer : styles.container}>
            <Surface
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: isFav ? 'rgba(56, 189, 248, 0.4)' : theme.colors.outline,
                    },
                ]}
                elevation={1}
            >
                <View style={styles.topRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.topRight}>
                        {badge && (
                            <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                                <Text style={[styles.badgeText, { color: theme.colors.onPrimaryContainer }]}>
                                    {badge}
                                </Text>
                            </View>
                        )}
                        <IconButton
                            icon={isFav ? 'heart' : 'heart-outline'}
                            iconColor={isFav ? theme.colors.error : theme.colors.onSurfaceVariant}
                            size={18}
                            style={styles.favBtn}
                            onPress={() => toggleFavorite(id)}
                        />
                    </View>
                </View>

                <Text style={styles.title} variant="titleMedium" numberOfLines={1}>
                    {title}
                </Text>

                {description && !compact ? (
                    <Text
                        variant="bodySmall"
                        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
                        numberOfLines={2}
                    >
                        {description}
                    </Text>
                ) : null}
            </Surface>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48.5%',
        marginBottom: 12,
    },
    compactContainer: {
        width: 140,
        marginRight: 10,
    },
    card: {
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        minHeight: 125,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    topRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    favBtn: {
        margin: 0,
        width: 28,
        height: 28,
    },
    title: {
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 4,
    },
    description: {
        fontSize: 11,
        lineHeight: 15,
    },
});
