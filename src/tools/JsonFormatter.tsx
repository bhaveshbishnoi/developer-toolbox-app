import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const JsonFormatter = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { addHistory } = useAppStore();

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            setOutput(formatted);
            setError('');
            addHistory({ toolId: 'JsonFormatter', input, output: formatted, timestamp: Date.now() });
        } catch (e: any) {
            setError(e.message || 'Invalid JSON');
            setOutput('');
        }
    };

    const handleMinify = () => {
        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            setOutput(minified);
            setError('');
            addHistory({ toolId: 'JsonFormatter', input, output: minified, timestamp: Date.now() });
        } catch (e: any) {
            setError(e.message || 'Invalid JSON');
            setOutput('');
        }
    };

    return (
        <ScreenWrapper>
            <InputField
                label="Input JSON"
                value={input}
                onChangeText={setInput}
                multiline
                placeholder='{"key": "value"}'
            />

            <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleFormat} style={styles.button} disabled={!input}>
                    Format
                </Button>
                <Button mode="contained-tonal" onPress={handleMinify} style={styles.button} disabled={!input}>
                    Minify
                </Button>
            </View>

            <OutputField
                label={error ? `Error: ${error}` : 'Output'}
                value={output}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
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
