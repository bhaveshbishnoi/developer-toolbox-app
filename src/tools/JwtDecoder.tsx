import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme, Chip } from 'react-native-paper';
import { jwtDecode } from 'jwt-decode';
import { useRoute } from '@react-navigation/native';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

const SAMPLE_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkJoYXZlc2ggRGV2IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.4PEf-Flnd5pZq-3L3NvdgBvV6vP0Jp_eWcZcI6_O99g';

export const JwtDecoder = () => {
    const route = useRoute<any>();
    const initialInput = route.params?.initialInput || '';

    const [input, setInput] = useState(initialInput);
    const [headerOutput, setHeaderOutput] = useState('');
    const [payloadOutput, setPayloadOutput] = useState('');
    const [expiryInfo, setExpiryInfo] = useState<{ text: string; isExpired: boolean } | null>(null);
    const [error, setError] = useState('');

    const theme = useTheme();
    const { addHistory } = useAppStore();

    useEffect(() => {
        if (initialInput) {
            handleDecode(initialInput);
        }
    }, [initialInput]);

    const handleDecode = (raw = input) => {
        let clean = raw.trim();
        if (clean.toLowerCase().startsWith('bearer ')) {
            clean = clean.slice(7).trim();
        }

        if (!clean) {
            setError('Please enter a JWT token');
            return;
        }

        try {
            const header = jwtDecode(clean, { header: true });
            const payload: any = jwtDecode(clean);

            const headerStr = JSON.stringify(header, null, 2);
            const payloadStr = JSON.stringify(payload, null, 2);

            setHeaderOutput(headerStr);
            setPayloadOutput(payloadStr);
            setError('');

            if (payload.exp) {
                const expDate = new Date(payload.exp * 1000);
                const isExpired = expDate.getTime() < Date.now();
                const diffMs = Math.abs(expDate.getTime() - Date.now());
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                const rel = isExpired
                    ? `Expired ${diffDays > 0 ? `${diffDays}d ` : ''}${diffHours}h ago`
                    : `Valid for another ${diffDays > 0 ? `${diffDays}d ` : ''}${diffHours}h`;

                setExpiryInfo({
                    text: `${expDate.toLocaleString()} (${rel})`,
                    isExpired,
                });
            } else {
                setExpiryInfo(null);
            }

            addHistory({
                toolId: 'JwtDecoder',
                input: clean.slice(0, 50) + '...',
                output: payloadStr.slice(0, 80),
                timestamp: Date.now(),
            });
        } catch {
            setError('Invalid or Malformed JWT token structure.');
            setHeaderOutput('');
            setPayloadOutput('');
            setExpiryInfo(null);
        }
    };

    return (
        <ScreenWrapper>
            <InputField
                label="JWT Token (with or without 'Bearer')"
                value={input}
                onChangeText={(t) => {
                    setInput(t);
                    if (error) setError('');
                }}
                multiline
                monospace
                placeholder="eyJhbGciOi..."
                sampleText={SAMPLE_JWT}
            />

            <Button
                mode="contained"
                icon="shield-check"
                onPress={() => handleDecode()}
                style={styles.button}
                disabled={!input.trim()}
            >
                Decode Token
            </Button>

            {error ? (
                <Text style={{ color: theme.colors.error, marginVertical: 6, fontWeight: 'bold' }}>
                    {error}
                </Text>
            ) : null}

            {expiryInfo && (
                <View
                    style={[
                        styles.expiryCard,
                        {
                            backgroundColor: expiryInfo.isExpired
                                ? 'rgba(239, 68, 68, 0.12)'
                                : 'rgba(52, 211, 153, 0.12)',
                            borderColor: expiryInfo.isExpired ? theme.colors.error : theme.colors.tertiary,
                        },
                    ]}
                >
                    <Text
                        variant="bodyMedium"
                        style={{
                            fontWeight: 'bold',
                            color: expiryInfo.isExpired ? theme.colors.error : theme.colors.tertiary,
                        }}
                    >
                        {expiryInfo.isExpired ? '⚠️ Token Expired: ' : '✅ Token Active: '}
                        {expiryInfo.text}
                    </Text>
                </View>
            )}

            {headerOutput ? <OutputField label="Header (Algorithm & Type)" value={headerOutput} /> : null}
            {payloadOutput ? <OutputField label="Payload (Claims & Data)" value={payloadOutput} /> : null}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    button: {
        marginVertical: 10,
    },
    expiryCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginVertical: 8,
    },
});
