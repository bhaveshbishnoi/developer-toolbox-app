import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, useTheme } from 'react-native-paper';
import { encode, decode } from 'base-64';
import utf8 from 'utf8';
import { useRoute } from '@react-navigation/native';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

const SAMPLE_TEXT = 'Developer Toolbox Android APK 🚀 Built with React Native & Expo';

export const Base64Encoder = () => {
    const route = useRoute<any>();
    const initialInput = route.params?.initialInput || '';

    const [input, setInput] = useState(initialInput);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [variant, setVariant] = useState<'standard' | 'urlsafe'>('standard');

    const theme = useTheme();
    const { addHistory } = useAppStore();

    useEffect(() => {
        if (initialInput) {
            handleEncode(initialInput);
        }
    }, [initialInput]);

    const toUrlSafe = (b64: string): string => {
        return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const fromUrlSafe = (urlSafeB64: string): string => {
        let b64 = urlSafeB64.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) {
            b64 += '=';
        }
        return b64;
    };

    const handleEncode = (raw = input) => {
        if (!raw) return;
        try {
            const bytes = utf8.encode(raw);
            let encoded = encode(bytes);
            if (variant === 'urlsafe') {
                encoded = toUrlSafe(encoded);
            }
            setOutput(encoded);
            setError('');
            addHistory({
                toolId: 'Base64Encoder',
                input: raw.slice(0, 80),
                output: encoded.slice(0, 80),
                timestamp: Date.now(),
            });
        } catch {
            setError('Error encoding input into UTF-8 Base64');
            setOutput('');
        }
    };

    const handleDecode = () => {
        if (!input) return;
        try {
            let clean = input.trim();
            if (variant === 'urlsafe' || clean.includes('-') || clean.includes('_')) {
                clean = fromUrlSafe(clean);
            }
            const decodedBytes = decode(clean);
            const text = utf8.decode(decodedBytes);
            setOutput(text);
            setError('');
            addHistory({
                toolId: 'Base64Encoder',
                input: input.slice(0, 80),
                output: text.slice(0, 80),
                timestamp: Date.now(),
            });
        } catch {
            setError('Invalid Base64 sequence. Please verify padding and format.');
            setOutput('');
        }
    };

    const handleSwap = () => {
        if (output && !error) {
            setInput(output);
            setOutput(input);
        }
    };

    return (
        <ScreenWrapper>
            <SegmentedButtons
                value={variant}
                onValueChange={(val) => setVariant(val as any)}
                buttons={[
                    { value: 'standard', label: 'Standard Base64' },
                    { value: 'urlsafe', label: 'URL-Safe (RFC 4648)' },
                ]}
                style={{ marginBottom: 12 }}
            />

            <InputField
                label="Input String"
                value={input}
                onChangeText={(t) => {
                    setInput(t);
                    if (error) setError('');
                }}
                multiline
                monospace
                placeholder="Enter plain text or Base64 string..."
                sampleText={SAMPLE_TEXT}
            />

            <View style={styles.buttonRow}>
                <Button mode="contained" onPress={() => handleEncode()} style={styles.button} disabled={!input}>
                    Encode Base64
                </Button>
                <Button mode="contained-tonal" onPress={handleDecode} style={styles.button} disabled={!input}>
                    Decode Base64
                </Button>
                <Button mode="outlined" icon="swap-vertical" onPress={handleSwap} disabled={!output || !!error}>
                    Swap
                </Button>
            </View>

            <OutputField
                label={error ? `Error: ${error}` : 'Base64 Output'}
                value={output}
                isError={!!error}
            />
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
