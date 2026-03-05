import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme, SegmentedButtons } from 'react-native-paper';
import axios from 'axios';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const ApiTester = () => {
    const [url, setUrl] = useState('');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState('');
    const [body, setBody] = useState('');

    const [response, setResponse] = useState('');
    const [status, setStatus] = useState<number | null>(null);
    const [time, setTime] = useState<number | null>(null);
    const [error, setError] = useState('');

    const theme = useTheme();
    const { addHistory } = useAppStore();

    const handleSend = async () => {
        setError('');
        setResponse('Loading...');
        setStatus(null);
        setTime(null);

        const startTime = Date.now();
        try {
            let parsedHeaders = {};
            if (headers) {
                try {
                    parsedHeaders = JSON.parse(headers);
                } catch (e) {
                    throw new Error('Invalid JSON in Headers');
                }
            }

            let parsedBody = undefined;
            if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    parsedBody = body; // send as is
                }
            }

            const res = await axios({
                method,
                url,
                headers: parsedHeaders,
                data: parsedBody,
            });

            const endTime = Date.now();
            setTime(endTime - startTime);
            setStatus(res.status);

            const formattedResponse = typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : String(res.data);
            setResponse(formattedResponse);

            addHistory({
                toolId: 'ApiTester',
                input: `${method} ${url}`,
                output: `${res.status} OK`,
                timestamp: Date.now()
            });

        } catch (e: any) {
            const endTime = Date.now();
            setTime(endTime - startTime);

            if (e.response) {
                setStatus(e.response.status);
                const formattedResponse = typeof e.response.data === 'object' ? JSON.stringify(e.response.data, null, 2) : String(e.response.data);
                setResponse(formattedResponse);
            } else {
                setError(e.message || 'Request failed');
                setResponse('');
            }
        }
    };

    return (
        <ScreenWrapper>
            <SegmentedButtons
                value={method}
                onValueChange={setMethod}
                buttons={[
                    { value: 'GET', label: 'GET' },
                    { value: 'POST', label: 'POST' },
                    { value: 'PUT', label: 'PUT' },
                    { value: 'DELETE', label: 'DEL' },
                ]}
                style={styles.methods}
                theme={{ colors: { secondaryContainer: theme.colors.primary, onSecondaryContainer: theme.colors.background } }}
            />

            <InputField
                label="API URL"
                value={url}
                onChangeText={setUrl}
                placeholder="https://api.example.com/data"
            />

            <InputField
                label="Headers (JSON format)"
                value={headers}
                onChangeText={setHeaders}
                multiline
                placeholder='{"Authorization": "Bearer token"}'
            />

            {['POST', 'PUT', 'PATCH'].includes(method) && (
                <InputField
                    label="Body (JSON/Text)"
                    value={body}
                    onChangeText={setBody}
                    multiline
                    placeholder='{"key": "value"}'
                />
            )}

            <Button mode="contained" onPress={handleSend} style={styles.button} disabled={!url}>
                Send Request
            </Button>

            {status && (
                <View style={styles.statusRow}>
                    <Text style={{ color: status >= 200 && status < 300 ? '#4CAF50' : theme.colors.error, fontWeight: 'bold' }}>
                        Status: {status}
                    </Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                        Time: {time}ms
                    </Text>
                </View>
            )}

            {error ? (
                <Text style={{ color: theme.colors.error, marginTop: 12 }}>{error}</Text>
            ) : null}

            {response && response !== 'Loading...' && (
                <OutputField label="Response" value={response} />
            )}
            {response === 'Loading...' && (
                <Text style={{ color: theme.colors.primary, marginTop: 12, textAlign: 'center' }}>Loading...</Text>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    methods: {
        marginBottom: 16,
    },
    button: {
        marginVertical: 12,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
        paddingHorizontal: 8,
    }
});
