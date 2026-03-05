import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { encode, decode } from 'base-64';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';
import utf8 from 'utf8';

export const Base64Encoder = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { addHistory } = useAppStore();

    const handleEncode = () => {
        try {
            const bytes = utf8.encode(input);
            const encoded = encode(bytes);
            setOutput(encoded);
            setError('');
            addHistory({ toolId: 'Base64Encoder', input, output: encoded, timestamp: Date.now() });
        } catch (e: any) {
            setError('Encoding error');
        }
    };

    const handleDecode = () => {
        try {
            const decodedBytes = decode(input);
            const text = utf8.decode(decodedBytes);
            setOutput(text);
            setError('');
            addHistory({ toolId: 'Base64Encoder', input, output: text, timestamp: Date.now() });
        } catch (e: any) {
            setError('Invalid Base64 string');
            setOutput('');
        }
    };

    return (
        <ScreenWrapper>
            <InputField
                label="Input Text or Base64"
                value={input}
                onChangeText={setInput}
                multiline
                placeholder="Enter text here..."
            />

            <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleEncode} style={styles.button} disabled={!input}>
                    Encode
                </Button>
                <Button mode="contained-tonal" onPress={handleDecode} style={styles.button} disabled={!input}>
                    Decode
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
