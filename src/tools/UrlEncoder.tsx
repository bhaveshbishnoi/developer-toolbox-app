import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, Text, useTheme } from 'react-native-paper';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

const SAMPLE_URL = 'https://api.github.com/search/repositories?q=developer-toolbox+language:typescript&sort=stars&order=desc';

export const UrlEncoder = () => {
    const [input, setInput] = useState(SAMPLE_URL);
    const [output, setOutput] = useState('');
    const [parsedDetails, setParsedDetails] = useState<string>('');
    const [error, setError] = useState('');

    const theme = useTheme();
    const { addHistory } = useAppStore();

    const handleEncode = () => {
        try {
            const encoded = encodeURIComponent(input);
            setOutput(encoded);
            setParsedDetails('');
            setError('');
            addHistory({ toolId: 'UrlEncoder', input, output: encoded.slice(0, 80), timestamp: Date.now() });
        } catch (e: any) {
            setError(e.message || 'URL Encoding error');
            setOutput('');
        }
    };

    const handleDecode = () => {
        try {
            const decoded = decodeURIComponent(input);
            setOutput(decoded);
            setParsedDetails('');
            setError('');
            addHistory({ toolId: 'UrlEncoder', input, output: decoded.slice(0, 80), timestamp: Date.now() });
        } catch (e: any) {
            setError(e.message || 'URL Decoding error');
            setOutput('');
        }
    };

    const handleParse = () => {
        try {
            const clean = input.trim();
            const urlObj = new URL(clean.startsWith('http') ? clean : `https://${clean}`);

            const paramsList: string[] = [];
            urlObj.searchParams.forEach((val, key) => {
                paramsList.push(`  • ${key}: ${val}`);
            });

            const breakdown = `Protocol: ${urlObj.protocol}\nHost: ${urlObj.host}\nHostname: ${urlObj.hostname}\nPort: ${urlObj.port || 'Default'}\nPath: ${urlObj.pathname}\nQuery Parameters (${paramsList.length}):\n${paramsList.length > 0 ? paramsList.join('\n') : '  None'}\nHash: ${urlObj.hash || 'None'}`;

            setParsedDetails(breakdown);
            setOutput(clean);
            setError('');
            addHistory({ toolId: 'UrlEncoder', input, output: `Parsed ${paramsList.length} params`, timestamp: Date.now() });
        } catch {
            setError('Unable to parse URL structure. Ensure it is a valid web address.');
            setParsedDetails('');
        }
    };

    return (
        <ScreenWrapper>
            <InputField
                label="URL or Text Input"
                value={input}
                onChangeText={(t) => {
                    setInput(t);
                    if (error) setError('');
                }}
                multiline
                monospace
                placeholder="https://example.com/?query=param"
                sampleText={SAMPLE_URL}
            />

            <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleEncode} style={styles.button} disabled={!input}>
                    Encode
                </Button>
                <Button mode="contained-tonal" onPress={handleDecode} style={styles.button} disabled={!input}>
                    Decode
                </Button>
                <Button mode="outlined" onPress={handleParse} style={styles.button} disabled={!input}>
                    Parse URL
                </Button>
            </View>

            {error ? (
                <Text style={{ color: theme.colors.error, marginVertical: 8, fontWeight: 'bold' }}>
                    {error}
                </Text>
            ) : null}

            {parsedDetails ? <OutputField label="URL Structure Breakdown" value={parsedDetails} /> : null}
            <OutputField label="Encoded / Decoded String" value={output} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
        marginVertical: 10,
    },
    button: {
        flex: 1,
    },
});
