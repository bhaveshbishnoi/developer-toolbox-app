import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const UrlEncoder = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { addHistory } = useAppStore();

    const handleEncode = () => {
        try {
            const encoded = encodeURIComponent(input);
            setOutput(encoded);
            setError('');
            addHistory({ toolId: 'UrlEncoder', input, output: encoded, timestamp: Date.now() });
        } catch (e: any) {
            setError(e.message || 'Encoding error');
            setOutput('');
        }
    };

    const handleDecode = () => {
        try {
            const decoded = decodeURIComponent(input);
            setOutput(decoded);
            setError('');
            addHistory({ toolId: 'UrlEncoder', input, output: decoded, timestamp: Date.now() });
        } catch (e: any) {
            setError(e.message || 'Decoding error');
            setOutput('');
        }
    };

    return (
        <ScreenWrapper>
            <InputField
                label="Input URL or Text"
                value={input}
                onChangeText={setInput}
                multiline
                placeholder="https://example.com/?name=bhavesh"
            />

            <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleEncode} style={styles.button} disabled={!input}>
                    Encode URL
                </Button>
                <Button mode="contained-tonal" onPress={handleDecode} style={styles.button} disabled={!input}>
                    Decode URL
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
