import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, useTheme, Text, IconButton, Chip } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';

interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    placeholder?: string;
    onPaste?: (text: string) => void;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    monospace?: boolean;
    sampleText?: string;
    onLoadSample?: () => void;
    helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    multiline = false,
    placeholder,
    onPaste,
    autoCapitalize = 'none',
    autoCorrect = false,
    monospace = false,
    sampleText,
    onLoadSample,
    helperText,
}) => {
    const theme = useTheme();

    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync();
        if (text) {
            if (onPaste) {
                onPaste(text);
            } else {
                onChangeText(value ? value + text : text);
            }
        }
    };

    const handleClear = () => {
        onChangeText('');
    };

    const handleSetSample = () => {
        if (onLoadSample) {
            onLoadSample();
        } else if (sampleText) {
            onChangeText(sampleText);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.labelRow}>
                    <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                        {label}
                    </Text>
                    {value.length > 0 && (
                        <Text variant="labelSmall" style={[styles.charCount, { color: theme.colors.onSurfaceVariant }]}>
                            {value.length} chars
                        </Text>
                    )}
                </View>

                <View style={styles.actions}>
                    {(sampleText || onLoadSample) && value.length === 0 && (
                        <Chip
                            compact
                            mode="outlined"
                            style={styles.sampleChip}
                            textStyle={{ fontSize: 11, color: theme.colors.primary }}
                            onPress={handleSetSample}
                        >
                            Sample
                        </Chip>
                    )}
                    {value.length > 0 && (
                        <IconButton
                            icon="close-circle-outline"
                            size={18}
                            onPress={handleClear}
                            style={styles.actionBtn}
                            iconColor={theme.colors.onSurfaceVariant}
                        />
                    )}
                    <IconButton
                        icon="content-paste"
                        size={18}
                        onPress={handlePaste}
                        style={styles.actionBtn}
                        iconColor={theme.colors.primary}
                    />
                </View>
            </View>

            <TextInput
                mode="outlined"
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                numberOfLines={multiline ? 6 : 1}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                style={[
                    styles.input,
                    multiline && styles.multilineInput,
                    monospace && { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
                ]}
                textColor={theme.colors.onSurface}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                theme={{
                    colors: {
                        background: theme.colors.surfaceVariant,
                    },
                }}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
            />
            {helperText ? (
                <Text variant="bodySmall" style={[styles.helper, { color: theme.colors.onSurfaceVariant }]}>
                    {helperText}
                </Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
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
    },
    charCount: {
        opacity: 0.8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sampleChip: {
        marginRight: 4,
        height: 26,
    },
    actionBtn: {
        margin: 0,
        padding: 0,
        width: 32,
        height: 32,
    },
    input: {
        borderRadius: 8,
    },
    multilineInput: {
        minHeight: 110,
        textAlignVertical: 'top',
    },
    helper: {
        marginTop: 4,
        paddingHorizontal: 4,
    },
});
