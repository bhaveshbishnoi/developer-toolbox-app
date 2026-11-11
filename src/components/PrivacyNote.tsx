import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PrivacyNoteProps {
    note: string;
}

export const PrivacyNote: React.FC<PrivacyNoteProps> = ({ note }) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={18} color={theme.colors.tertiary} style={styles.icon} />
            <Text variant="bodySmall" style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>
                {note}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginVertical: 10,
    },
    icon: {
        marginRight: 8,
    },
    text: {
        flex: 1,
        lineHeight: 16,
    },
});

