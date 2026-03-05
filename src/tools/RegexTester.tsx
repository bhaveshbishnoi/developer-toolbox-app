import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store';

export const RegexTester = () => {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState('g');
    const [testString, setTestString] = useState('');
    const [matches, setMatches] = useState<string[]>([]);
    const [error, setError] = useState('');
    const theme = useTheme();
    const { addHistory } = useAppStore();

    const handleTest = () => {
        try {
            const regex = new RegExp(pattern, flags);
            const matched = testString.match(regex);

            if (matched) {
                setMatches(Array.from(matched));
            } else {
                setMatches([]);
            }
            setError('');

            addHistory({
                toolId: 'RegexTester',
                input: `/${pattern}/${flags}`,
                output: matched ? `${matched.length} matches` : '0 matches',
                timestamp: Date.now()
            });
        } catch (e: any) {
            setError(e.message || 'Invalid Regular Expression');
            setMatches([]);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.regexRow}>
                <View style={{ flex: 3, marginRight: 8 }}>
                    <InputField
                        label="Regex Pattern"
                        value={pattern}
                        onChangeText={setPattern}
                        placeholder="^[a-z]+$"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <InputField
                        label="Flags"
                        value={flags}
                        onChangeText={setFlags}
                        placeholder="gmi"
                    />
                </View>
            </View>

            <InputField
                label="Test String"
                value={testString}
                onChangeText={setTestString}
                multiline
                placeholder="Enter text to test against..."
            />

            <Button mode="contained" onPress={handleTest} style={styles.button} disabled={!pattern || !testString}>
                Test Regex
            </Button>

            {error ? (
                <Text style={{ color: theme.colors.error, marginTop: 12 }}>{error}</Text>
            ) : null}

            <View style={styles.resultsContainer}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Matches ({matches.length})
                </Text>
                {matches.map((match, i) => (
                    <View key={i} style={[styles.matchBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={{ fontFamily: 'monospace', color: theme.colors.onSurface }}>
                            {match}
                        </Text>
                    </View>
                ))}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    regexRow: {
        flexDirection: 'row',
    },
    button: {
        marginVertical: 12,
    },
    resultsContainer: {
        marginTop: 16,
    },
    matchBox: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    }
});
