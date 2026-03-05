import React from 'react';
import { View, StyleSheet, Share } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';

interface OutputFieldProps {
    label: string;
    value: string;
}

export const OutputField: React.FC<OutputFieldProps> = ({ label, value }) => {
    const theme = useTheme();

    const handleCopy = async () => {
        if (value) {
            await Clipboard.setStringAsync(value);
        }
    };

    const handleShare = async () => {
        if (value) {
            try {
                await Share.share({ message: value });
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>{label}</Text>
                <View style={styles.actions}>
                    <IconButton icon="content-copy" size={20} onPress={handleCopy} disabled={!value} />
                    <IconButton icon="share-variant" size={20} onPress={handleShare} disabled={!value} />
                </View>
            </View>
            <Surface style={[styles.surface, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
                <Text variant="bodyMedium" style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                    {value || 'No output'}
                </Text>
            </Surface>
        </View>
    );
};

import { Platform } from 'react-native';

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    actions: {
        flexDirection: 'row',
    },
    surface: {
        padding: 16,
        borderRadius: 8,
        minHeight: 100,
    },
});
