import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, useTheme, Chip, TextInput } from 'react-native-paper';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

const PRESETS = [
    { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', test: 'Contact support@developer.org or admin@box.io' },
    { label: 'URL', pattern: 'https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!$&\'()*+,;=.]+', test: 'Visit https://github.com and http://localhost:8080' },
    { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', test: 'IP addresses 192.168.1.1 and 10.0.0.1' },
    { label: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', test: 'Colors #FFF, #38bdf8 and #131b2a' },
    { label: 'Date', pattern: '\\d{4}-\\d{2}-\\d{2}', test: 'Dates 2026-03-05 and 2026-11-11' },
];

export const RegexTester = () => {
    const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
    const [flags, setFlags] = useState('g');
    const [testString, setTestString] = useState('Contact team at support@devtools.app or info@android.net');
    const [replacePattern, setReplacePattern] = useState('');
    const [replaceResult, setReplaceResult] = useState('');
    const [matches, setMatches] = useState<{ match: string; index: number; groups: string[] }[]>([]);
    const [error, setError] = useState('');

    const theme = useTheme();
    const { addHistory } = useAppStore();

    const handleTest = () => {
        if (!pattern.trim()) {
            setMatches([]);
            setError('');
            return;
        }

        try {
            const regex = new RegExp(pattern, flags);
            setError('');

            const foundMatches: { match: string; index: number; groups: string[] }[] = [];

            if (flags.includes('g')) {
                let match;
                while ((match = regex.exec(testString)) !== null) {
                    foundMatches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1),
                    });
                    if (regex.lastIndex === match.index) {
                        regex.lastIndex++; // Prevent infinite loop on zero-width match
                    }
                }
            } else {
                const match = regex.exec(testString);
                if (match) {
                    foundMatches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1),
                    });
                }
            }

            setMatches(foundMatches);

            if (replacePattern) {
                const replaced = testString.replace(regex, replacePattern);
                setReplaceResult(replaced);
            } else {
                setReplaceResult('');
            }

            addHistory({
                toolId: 'RegexTester',
                input: `/${pattern}/${flags}`,
                output: `${foundMatches.length} matches found`,
                timestamp: Date.now(),
            });
        } catch (e: any) {
            setError(e.message || 'Invalid Regular Expression syntax');
            setMatches([]);
            setReplaceResult('');
        }
    };

    const toggleFlag = (flagChar: string) => {
        const newFlags = flags.includes(flagChar) ? flags.replace(flagChar, '') : flags + flagChar;
        setFlags(newFlags);
    };

    return (
        <ScreenWrapper>
            {/* Presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
                {PRESETS.map((p) => (
                    <Chip
                        key={p.label}
                        compact
                        mode="outlined"
                        onPress={() => {
                            setPattern(p.pattern);
                            setTestString(p.test);
                            setError('');
                        }}
                        style={styles.presetChip}
                    >
                        {p.label}
                    </Chip>
                ))}
            </ScrollView>

            <InputField
                label="Regex Pattern"
                value={pattern}
                onChangeText={setPattern}
                monospace
                placeholder="[a-z]+"
            />

            {/* Flags Row */}
            <View style={styles.flagsRow}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>
                    Flags:
                </Text>
                {['g', 'i', 'm', 's'].map((f) => {
                    const active = flags.includes(f);
                    return (
                        <Chip
                            key={f}
                            compact
                            selected={active}
                            onPress={() => toggleFlag(f)}
                            style={[styles.flagChip, active && { backgroundColor: theme.colors.primaryContainer }]}
                            textStyle={{ fontSize: 11, fontWeight: '700' }}
                        >
                            {f} ({f === 'g' ? 'global' : f === 'i' ? 'ignore case' : f === 'm' ? 'multiline' : 'dotAll'})
                        </Chip>
                    );
                })}
            </View>

            <InputField
                label="Test String"
                value={testString}
                onChangeText={setTestString}
                multiline
                monospace
                placeholder="Enter string to test..."
            />

            <InputField
                label="Replacement Pattern (Optional)"
                value={replacePattern}
                onChangeText={setReplacePattern}
                monospace
                placeholder="e.g. [$1] or [REDACTED]"
            />

            <Button
                mode="contained"
                icon="regex"
                onPress={handleTest}
                style={styles.button}
                disabled={!pattern || !testString}
            >
                Execute Regex Test
            </Button>

            {error ? (
                <Text style={{ color: theme.colors.error, marginVertical: 8, fontWeight: 'bold' }}>
                    {error}
                </Text>
            ) : null}

            {replaceResult ? (
                <OutputField label="Substitution / Replacement Result" value={replaceResult} />
            ) : null}

            {/* Matches list */}
            <View style={styles.matchesContainer}>
                <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 8 }}>
                    Matches Found ({matches.length})
                </Text>

                {matches.length === 0 && !error ? (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        No matches found.
                    </Text>
                ) : (
                    matches.map((m, idx) => (
                        <View key={idx} style={[styles.matchCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <View style={styles.matchCardHeader}>
                                <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    Match #{idx + 1} (index {m.index})
                                </Text>
                            </View>
                            <Text selectable style={{ fontFamily: 'monospace', color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                {m.match}
                            </Text>
                            {m.groups.length > 0 && (
                                <View style={{ marginTop: 6 }}>
                                    {m.groups.map((g, gIdx) => (
                                        <Text key={gIdx} variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontFamily: 'monospace' }}>
                                            Group ${gIdx + 1}: {g}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    presetsRow: {
        marginBottom: 8,
    },
    presetChip: {
        marginRight: 6,
        height: 30,
    },
    flagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginVertical: 6,
    },
    flagChip: {
        height: 28,
    },
    button: {
        marginVertical: 10,
    },
    matchesContainer: {
        marginTop: 12,
    },
    matchCard: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    matchCardHeader: {
        marginBottom: 4,
    },
});
