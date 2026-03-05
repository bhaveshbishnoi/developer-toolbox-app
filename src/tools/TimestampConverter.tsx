import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, SegmentedButtons, useTheme } from 'react-native-paper';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const TimestampConverter = () => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('timestampToDate');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { addHistory } = useAppStore();
    const theme = useTheme();

    const handleConvert = () => {
        setError('');

        try {
            if (mode === 'timestampToDate') {
                let ts = parseInt(input, 10);
                if (isNaN(ts)) throw new Error('Invalid timestamp');

                if (input.length <= 10) ts *= 1000;

                const date = new Date(ts);
                if (isNaN(date.getTime())) throw new Error('Invalid date');

                const result = `UTC: ${date.toUTCString()}\nLocal: ${date.toLocaleString()}`;
                setOutput(result);

                addHistory({ toolId: 'TimestampConverter', input, output: date.toLocaleString(), timestamp: Date.now() });
            } else {
                const date = new Date(input);
                if (isNaN(date.getTime())) throw new Error('Invalid date format. Try YYYY-MM-DD');

                const seconds = Math.floor(date.getTime() / 1000).toString();
                const millis = date.getTime().toString();

                const result = `Seconds: ${seconds}\nMilliseconds: ${millis}`;
                setOutput(result);

                addHistory({ toolId: 'TimestampConverter', input, output: seconds, timestamp: Date.now() });
            }
        } catch (e: any) {
            setError(e.message || 'Conversion error');
            setOutput('');
        }
    };

    const handleNow = () => {
        const now = Date.now();
        if (mode === 'timestampToDate') {
            setInput(Math.floor(now / 1000).toString());
        } else {
            setInput(new Date().toISOString());
        }
    };

    return (
        <ScreenWrapper>
            <SegmentedButtons
                value={mode}
                onValueChange={(val) => {
                    setMode(val);
                    setInput('');
                    setOutput('');
                    setError('');
                }}
                buttons={[
                    { value: 'timestampToDate', label: 'Timestamp → Date' },
                    { value: 'dateToTimestamp', label: 'Date → Timestamp' },
                ]}
                style={styles.segmented}
                theme={{ colors: { secondaryContainer: theme.colors.primary, onSecondaryContainer: theme.colors.background } }}
            />

            <InputField
                label={mode === 'timestampToDate' ? 'Unix Timestamp' : 'Date String (e.g. 2026-03-05T12:00:00Z)'}
                value={input}
                onChangeText={setInput}
                placeholder={mode === 'timestampToDate' ? '1700000000' : 'YYYY-MM-DDTHH:mm:ssZ'}
            />

            <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleConvert} style={styles.button} disabled={!input}>
                    Convert
                </Button>
                <Button mode="contained-tonal" onPress={handleNow} style={styles.button}>
                    Use Current Time
                </Button>
            </View>

            {error ? (
                <Text style={{ color: theme.colors.error, marginTop: 12 }}>{error}</Text>
            ) : null}

            <OutputField label="Result" value={output} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    segmented: {
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    }
});
