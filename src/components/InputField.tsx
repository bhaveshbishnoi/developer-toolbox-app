import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme, Text, IconButton } from 'react-native-paper';
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
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    multiline = false,
    placeholder,
    onPaste,
    autoCapitalize = 'none',
    autoCorrect = false
}) => {
    const theme = useTheme();

    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync();
        if (text) {
            if (onPaste) {
                onPaste(text);
            } else {
                onChangeText(value ? value + text : text); // Append or set? usually just insert cursor, but full set is fine
            }
        }
    };

    const handleClear = () => {
        onChangeText('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>{label}</Text>
                <View style={styles.actions}>
                    {value.length > 0 && (
                        <IconButton icon="close" size={20} onPress={handleClear} />
                    )}
                    <IconButton icon="content-paste" size={20} onPress={handlePaste} />
                </View>
            </View>
            <TextInput
                mode="outlined"
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                numberOfLines={multiline ? 6 : 1}
                placeholder={placeholder}
                style={[styles.input, multiline && styles.multilineInput]}
                textColor={theme.colors.onSurface}
                theme={{ colors: { background: theme.colors.surfaceVariant } }}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
            />
        </View>
    );
};

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
    input: {
    },
    multilineInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    }
});
