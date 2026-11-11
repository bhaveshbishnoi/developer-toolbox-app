import React, { useState } from 'react';
import { View, StyleSheet, Share, Platform, ScrollView } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';

interface OutputFieldProps {
    label: string;
    value: string;
    isError?: boolean;
    maxHeight?: number;
    actionsExtra?: React.ReactNode;
}

export const OutputField: React.FC<OutputFieldProps> = ({
    label,
    value,
    isError = false,
    maxHeight = 280,
    actionsExtra,
}) => {
    const theme = useTheme();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (value) {
            await Clipboard.setStringAsync(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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

    const lineCount = value ? value.split('\n').length : 0;
    const byteSize = value ? new Blob([value]).size : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.labelRow}>
                    <Text
                        variant="titleSmall"
                        style={{
                            color: isError ? theme.colors.error : theme.colors.primary,
                            fontWeight: '700',
                        }}
                    >
                        {label}
                    </Text>
                    {value.length > 0 && !isError && (
                        <Text variant="labelSmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                            {lineCount > 1 ? `${lineCount} lines • ` : ''}{byteSize > 1024 ? `${(byteSize / 1024).toFixed(1)} KB` : `${byteSize} B`}
                        </Text>
                    )}
                </View>

                <View style={styles.actions}>
                    {actionsExtra}
                    <IconButton
                        icon={copied ? 'check-bold' : 'content-copy'}
                        iconColor={copied ? theme.colors.tertiary : theme.colors.primary}
                        size={18}
                        onPress={handleCopy}
                        disabled={!value}
                        style={styles.actionBtn}
                    />
                    <IconButton
                        icon="share-variant-outline"
                        iconColor={theme.colors.onSurfaceVariant}
                        size={18}
                        onPress={handleShare}
                        disabled={!value}
                        style={styles.actionBtn}
                    />
                </View>
            </View>

            <Surface
                style={[
                    styles.surface,
                    {
                        backgroundColor: isError ? 'rgba(239, 68, 68, 0.08)' : theme.colors.surfaceVariant,
                        borderColor: isError ? theme.colors.error : theme.colors.outline,
                        maxHeight,
                    },
                ]}
                elevation={1}
            >
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                    <Text
                        selectable
                        variant="bodyMedium"
                        style={[
                            styles.text,
                            {
                                color: isError ? theme.colors.error : theme.colors.onSurface,
                                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                            },
                        ]}
                    >
                        {value || (isError ? 'An error occurred' : 'No output generated yet')}
                    </Text>
                </ScrollView>
            </Surface>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingHorizontal: 2,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    metaText: {
        opacity: 0.8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        margin: 0,
        width: 32,
        height: 32,
    },
    surface: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        minHeight: 80,
    },
    text: {
        fontSize: 13,
        lineHeight: 19,
    },
});
