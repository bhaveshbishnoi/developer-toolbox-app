import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, SegmentedButtons, useTheme } from 'react-native-paper';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const TimestampConverter = () => {
    const [nowTimestamp, setNowTimestamp] = useState(Math.floor(Date.now() / 1000));
    const [input, setInput] = useState(String(Math.floor(Date.now() / 1000)));
    const [mode, setMode] = useState<'timestampToDate' | 'dateToTimestamp'>('timestampToDate');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const { addHistory } = useAppStore();
    const theme = useTheme();

    // Live clock ticker
    useEffect(() => {
        const interval = setInterval(() => {
            setNowTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleConvert = (val = input) => {
        setError('');
        if (!val.trim()) {
            setOutput('');
            return;
        }

        try {
            if (mode === 'timestampToDate') {
                let ts = parseInt(val.trim(), 10);
                if (isNaN(ts)) throw new Error('Invalid timestamp number');

                // Auto-detect seconds vs milliseconds
                if (val.trim().length <= 10) ts *= 1000;

                const date = new Date(ts);
                if (isNaN(date.getTime())) throw new Error('Invalid date computed from timestamp');

                const diffMs = Date.now() - date.getTime();
                const diffMin = Math.round(diffMs / 60000);
                let relative = '';
                if (Math.abs(diffMin) < 60) {
                    relative = diffMin >= 0 ? `${diffMin} min ago` : `in ${Math.abs(diffMin)} min`;
                } else {
                    const diffHr = Math.round(diffMin / 60);
                    relative = diffHr >= 0 ? `${diffHr} hours ago` : `in ${Math.abs(diffHr)} hours`;
                }

                const result = `ISO 8601: ${date.toISOString()}\nUTC String: ${date.toUTCString()}\nLocal Time: ${date.toLocaleString()}\nRelative: ${relative}\nMilliseconds: ${date.getTime()}`;

                setOutput(result);
                addHistory({
                    toolId: 'TimestampConverter',
                    input: val,
                    output: date.toISOString(),
                    timestamp: Date.now(),
                });
            } else {
                const date = new Date(val.trim());
                if (isNaN(date.getTime())) throw new Error('Invalid date string. Format: YYYY-MM-DD or ISO 8601');

                const seconds = Math.floor(date.getTime() / 1000);
                const millis = date.getTime();

                const result = `Unix Seconds: ${seconds}\nUnix Milliseconds: ${millis}\nUTC: ${date.toUTCString()}\nLocal: ${date.toLocaleString()}`;

                setOutput(result);
                addHistory({
                    toolId: 'TimestampConverter',
                    input: val,
                    output: `${seconds}`,
                    timestamp: Date.now(),
                });
            }
        } catch (e: any) {
            setError(e.message || 'Conversion error');
            setOutput('');
        }
    };

    const handleOffset = (secondsOffset: number) => {
        if (mode === 'timestampToDate') {
            const current = parseInt(input, 10) || nowTimestamp;
            const updated = String(current + secondsOffset);
            setInput(updated);
            handleConvert(updated);
        }
    };

    return (
        <ScreenWrapper>
            {/* Live Clock Card */}
            <View style={[styles.tickerCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    CURRENT UNIX EPOCH TICKER
                </Text>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', fontFamily: 'monospace', marginVertical: 4 }}>
                    {nowTimestamp}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(nowTimestamp * 1000).toUTCString()}
                </Text>
            </View>

            <SegmentedButtons
                value={mode}
                onValueChange={(val) => {
                    setMode(val as any);
                    setInput('');
                    setOutput('');
                    setError('');
                }}
                buttons={[
                    { value: 'timestampToDate', label: 'Timestamp → Date' },
                    { value: 'dateToTimestamp', label: 'Date → Timestamp' },
                ]}
                style={styles.segmented}
                theme={{ colors: { secondaryContainer: theme.colors.primaryContainer, onSecondaryContainer: theme.colors.primary } }}
            />

            <InputField
                label={mode === 'timestampToDate' ? 'Unix Timestamp (Seconds or Millis)' : 'Date String (ISO 8601)'}
                value={input}
                onChangeText={(t) => {
                    setInput(t);
                    if (error) setError('');
                }}
                placeholder={mode === 'timestampToDate' ? '1700000000' : '2026-03-05T12:00:00Z'}
            />

            {/* Quick Offset Buttons */}
            {mode === 'timestampToDate' && (
                <View style={styles.offsetRow}>
                    <Button compact mode="outlined" onPress={() => handleOffset(-3600)} style={styles.offsetBtn}>
                        -1 Hour
                    </Button>
                    <Button compact mode="outlined" onPress={() => handleOffset(-86400)} style={styles.offsetBtn}>
                        -1 Day
                    </Button>
                    <Button compact mode="outlined" onPress={() => handleOffset(3600)} style={styles.offsetBtn}>
                        +1 Hour
                    </Button>
                    <Button compact mode="outlined" onPress={() => handleOffset(86400)} style={styles.offsetBtn}>
                        +1 Day
                    </Button>
                </View>
            )}

            <View style={styles.buttonRow}>
                <Button mode="contained" onPress={() => handleConvert()} style={styles.button} disabled={!input}>
                    Convert
                </Button>
                <Button
                    mode="contained-tonal"
                    onPress={() => {
                        const val = mode === 'timestampToDate' ? String(Math.floor(Date.now() / 1000)) : new Date().toISOString();
                        setInput(val);
                        handleConvert(val);
                    }}
                    style={styles.button}
                >
                    Current Time
                </Button>
            </View>

            {error ? (
                <Text style={{ color: theme.colors.error, marginVertical: 8, fontWeight: 'bold' }}>
                    {error}
                </Text>
            ) : null}

            <OutputField label="Converted Date & Time" value={output} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    tickerCard: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 14,
        alignItems: 'center',
    },
    segmented: {
        marginBottom: 14,
    },
    offsetRow: {
        flexDirection: 'row',
        gap: 6,
        marginVertical: 6,
    },
    offsetBtn: {
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
        marginVertical: 10,
    },
    button: {
        flex: 1,
    },
});
