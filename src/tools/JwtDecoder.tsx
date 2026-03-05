import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { jwtDecode } from 'jwt-decode';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const JwtDecoder = () => {
    const [input, setInput] = useState('');
    const [headerOutput, setHeaderOutput] = useState('');
    const [payloadOutput, setPayloadOutput] = useState('');
    const [expiry, setExpiry] = useState('');
    const [error, setError] = useState('');
    const theme = useTheme();
    const { addHistory } = useAppStore();

    const handleDecode = () => {
        try {
            const header = jwtDecode(input, { header: true });
            const payload = jwtDecode(input);

            const headerStr = JSON.stringify(header, null, 2);
            const payloadStr = JSON.stringify(payload, null, 2);

            setHeaderOutput(headerStr);
            setPayloadOutput(payloadStr);
            setError('');

            if ((payload as any).exp) {
                const expDate = new Date((payload as any).exp * 1000);
                const isExpired = expDate.getTime() < Date.now();
                setExpiry(`Expires: ${expDate.toLocaleString()} (${isExpired ? 'Expired' : 'Valid'})`);
            } else {
                setExpiry('No expiry information');
            }

            addHistory({ toolId: 'JwtDecoder', input, output: payloadStr, timestamp: Date.now() });
        } catch (e: any) {
            setError('Invalid or Malformed JWT Token');
            setHeaderOutput('');
            setPayloadOutput('');
            setExpiry('');
        }
    };

    return (
        <ScreenWrapper>
            <InputField
                label="JWT Token"
                value={input}
                onChangeText={setInput}
                multiline
                placeholder="eyJhbG..."
            />

            <Button mode="contained" onPress={handleDecode} style={styles.button} disabled={!input}>
                Decode Token
            </Button>

            {error ? (
                <Text style={{ color: theme.colors.error, marginTop: 12 }}>{error}</Text>
            ) : null}

            {expiry ? (
                <Text style={{ color: theme.colors.primary, marginVertical: 8, fontWeight: 'bold' }}>
                    {expiry}
                </Text>
            ) : null}

            {headerOutput ? (
                <OutputField
                    label="Header"
                    value={headerOutput}
                />
            ) : null}

            {payloadOutput ? (
                <OutputField
                    label="Payload"
                    value={payloadOutput}
                />
            ) : null}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    button: {
        marginVertical: 12,
    }
});
