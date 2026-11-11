import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, useTheme, Chip, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

const SAMPLE_JSON = `{\n  "name": "Developer Toolbox",\n  "version": "1.0.0",\n  "active": true,\n  "features": ["Diagnostics", "Crypto", "Formatters"],\n  "specs": {\n    "platform": "Android",\n    "sdk": 35\n  }\n}`;

export const JsonFormatter = () => {
    const route = useRoute<any>();
    const initialInput = route.params?.initialInput || '';

    const [input, setInput] = useState(initialInput);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [indent, setIndent] = useState('2');
    const [sortKeys, setSortKeys] = useState(false);
    const [stats, setStats] = useState<{ keys: number; depth: number } | null>(null);

    const theme = useTheme();
    const { addHistory } = useAppStore();

    useEffect(() => {
        if (initialInput) {
            handleFormat(initialInput, indent, sortKeys);
        }
    }, [initialInput]);

    const sortObjectKeys = (obj: any): any => {
        if (Array.isArray(obj)) {
            return obj.map(sortObjectKeys);
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj)
                .sort()
                .reduce((acc: any, key: string) => {
                    acc[key] = sortObjectKeys(obj[key]);
                    return acc;
                }, {});
        }
        return obj;
    };

    const countKeysAndDepth = (obj: any, currentDepth = 1): { keys: number; depth: number } => {
        let keys = 0;
        let maxDepth = currentDepth;

        if (Array.isArray(obj)) {
            for (const item of obj) {
                if (typeof item === 'object' && item !== null) {
                    const child = countKeysAndDepth(item, currentDepth + 1);
                    keys += child.keys;
                    maxDepth = Math.max(maxDepth, child.depth);
                }
            }
        } else if (obj !== null && typeof obj === 'object') {
            const propKeys = Object.keys(obj);
            keys += propKeys.length;
            for (const k of propKeys) {
                const val = obj[k];
                if (typeof val === 'object' && val !== null) {
                    const child = countKeysAndDepth(val, currentDepth + 1);
                    keys += child.keys;
                    maxDepth = Math.max(maxDepth, child.depth);
                }
            }
        }
        return { keys, depth: maxDepth };
    };

    const handleFormat = (rawInput = input, indentChoice = indent, shouldSort = sortKeys) => {
        if (!rawInput.trim()) {
            setOutput('');
            setError('');
            setStats(null);
            return;
        }

        try {
            let parsed = JSON.parse(rawInput);
            if (shouldSort) {
                parsed = sortObjectKeys(parsed);
            }

            const space = indentChoice === 'min' ? 0 : parseInt(indentChoice, 10);
            const formatted = space === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, space);

            setOutput(formatted);
            setError('');
            setStats(countKeysAndDepth(parsed));

            addHistory({
                toolId: 'JsonFormatter',
                input: rawInput.slice(0, 80),
                output: formatted.slice(0, 80),
                timestamp: Date.now(),
            });
        } catch (e: any) {
            setError(e.message || 'Invalid JSON syntax');
            setOutput('');
            setStats(null);
        }
    };

    return (
        <ScreenWrapper>
            <InputField
                label="Input JSON"
                value={input}
                onChangeText={(text) => {
                    setInput(text);
                    if (error) setError('');
                }}
                multiline
                monospace
                placeholder='{"key": "value"}'
                sampleText={SAMPLE_JSON}
            />

            {/* Options */}
            <View style={styles.optionsRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <SegmentedButtons
                        value={indent}
                        onValueChange={(val) => {
                            setIndent(val);
                            if (input) handleFormat(input, val, sortKeys);
                        }}
                        buttons={[
                            { value: '2', label: '2 Spaces' },
                            { value: '4', label: '4 Spaces' },
                            { value: 'min', label: 'Minify' },
                        ]}
                    />
                </View>
                <Chip
                    selected={sortKeys}
                    onPress={() => {
                        const newSort = !sortKeys;
                        setSortKeys(newSort);
                        if (input) handleFormat(input, indent, newSort);
                    }}
                    style={styles.chip}
                >
                    Sort Keys
                </Chip>
            </View>

            <View style={styles.buttonRow}>
                <Button
                    mode="contained"
                    icon="code-json"
                    onPress={() => handleFormat()}
                    style={styles.button}
                    disabled={!input.trim()}
                >
                    Format JSON
                </Button>
            </View>

            {stats && (
                <View style={[styles.statsRow, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Structure Analysis: {stats.keys} keys • Max depth {stats.depth} levels
                    </Text>
                </View>
            )}

            <OutputField
                label={error ? `Error: ${error}` : 'Formatted JSON Output'}
                value={output}
                isError={!!error}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    chip: {
        height: 38,
    },
    buttonRow: {
        marginVertical: 8,
    },
    button: {
        borderRadius: 10,
    },
    statsRow: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginVertical: 4,
    },
});
