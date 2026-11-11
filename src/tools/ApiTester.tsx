import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, useTheme, SegmentedButtons, Chip } from 'react-native-paper';
import axios from 'axios';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

const SAMPLES = [
    { label: 'JSON API GET', url: 'https://jsonplaceholder.typicode.com/todos/1', method: 'GET' },
    { label: 'HTTPBin Headers', url: 'https://httpbin.org/headers', method: 'GET' },
    { label: 'POST Echo', url: 'https://httpbin.org/post', method: 'POST', body: '{"message": "Hello from Android ToolBox"}' },
];

export const ApiTester = () => {
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState('{\n  "Accept": "application/json"\n}');
    const [body, setBody] = useState('');
    const [response, setResponse] = useState('');
    const [responseHeaders, setResponseHeaders] = useState('');
    const [status, setStatus] = useState<number | null>(null);
    const [statusText, setStatusText] = useState<string>('');
    const [time, setTime] = useState<number | null>(null);
    const [sizeBytes, setSizeBytes] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const theme = useTheme();
    const { addHistory } = useAppStore();

    const handleSend = async () => {
        if (!url.trim()) return;
        let finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = `https://${finalUrl}`;
            setUrl(finalUrl);
        }

        setError('');
        setLoading(true);
        setStatus(null);
        setTime(null);
        setSizeBytes(null);
        setResponse('');
        setResponseHeaders('');

        const startTime = Date.now();

        try {
            let parsedHeaders = {};
            if (headers.trim()) {
                try {
                    parsedHeaders = JSON.parse(headers);
                } catch {
                    throw new Error('Invalid JSON format in custom headers');
                }
            }

            let parsedBody = undefined;
            if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
                try {
                    parsedBody = JSON.parse(body);
                } catch {
                    parsedBody = body;
                }
            }

            const res = await axios({
                method,
                url: finalUrl,
                headers: parsedHeaders,
                data: parsedBody,
                timeout: 10000,
                validateStatus: () => true, // capture all status codes
            });

            const elapsed = Date.now() - startTime;
            setTime(elapsed);
            setStatus(res.status);
            setStatusText(res.statusText || '');

            const formattedResponse = typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : String(res.data);
            setResponse(formattedResponse);
            setSizeBytes(new Blob([formattedResponse]).size);

            if (res.headers) {
                setResponseHeaders(JSON.stringify(res.headers, null, 2));
            }

            addHistory({
                toolId: 'ApiTester',
                input: `${method} ${finalUrl}`,
                output: `${res.status} ${res.statusText || 'OK'} (${elapsed}ms)`,
                timestamp: Date.now(),
            });
        } catch (e: any) {
            setTime(Date.now() - startTime);
            setError(e.message || 'Network request failed or timed out');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (code: number) => {
        if (code >= 200 && code < 300) return theme.colors.tertiary; // Emerald
        if (code >= 300 && code < 400) return theme.colors.primary; // Blue
        if (code >= 400 && code < 500) return '#F59E0B'; // Amber
        return theme.colors.error; // Red
    };

    return (
        <ScreenWrapper>
            {/* Quick Presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
                {SAMPLES.map((s) => (
                    <Chip
                        key={s.label}
                        compact
                        mode="outlined"
                        onPress={() => {
                            setUrl(s.url);
                            setMethod(s.method);
                            if (s.body) setBody(s.body);
                        }}
                        style={styles.presetChip}
                    >
                        {s.label}
                    </Chip>
                ))}
            </ScrollView>

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
                theme={{ colors: { secondaryContainer: theme.colors.primaryContainer, onSecondaryContainer: theme.colors.primary } }}
            />

            <InputField
                label="API Endpoint URL"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                placeholder="https://api.example.com/data"
            />

            <InputField
                label="Request Headers (JSON)"
                value={headers}
                onChangeText={setHeaders}
                multiline
                monospace
                placeholder='{"Authorization": "Bearer token"}'
            />

            {['POST', 'PUT', 'PATCH'].includes(method) && (
                <InputField
                    label="Request Body (JSON / Text)"
                    value={body}
                    onChangeText={setBody}
                    multiline
                    monospace
                    placeholder='{"title": "foo", "body": "bar"}'
                />
            )}

            <Button
                mode="contained"
                icon="send"
                onPress={handleSend}
                loading={loading}
                disabled={loading || !url.trim()}
                style={styles.sendBtn}
            >
                Send HTTP Request
            </Button>

            {status !== null && (
                <View style={[styles.statusBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.statusBadgeRow}>
                        <Text style={[styles.statusBadge, { color: getStatusColor(status) }]}>
                            HTTP {status} {statusText}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {time} ms • {sizeBytes ? `${(sizeBytes / 1024).toFixed(2)} KB` : ''}
                        </Text>
                    </View>
                </View>
            )}

            {error ? (
                <Text style={{ color: theme.colors.error, marginVertical: 8, fontWeight: 'bold' }}>
                    {error}
                </Text>
            ) : null}

            {response ? <OutputField label="HTTP Response Body" value={response} /> : null}
            {responseHeaders ? <OutputField label="Response Headers" value={responseHeaders} /> : null}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    presetsRow: {
        marginBottom: 10,
    },
    presetChip: {
        marginRight: 8,
        height: 32,
    },
    methods: {
        marginBottom: 10,
    },
    sendBtn: {
        marginVertical: 12,
    },
    statusBox: {
        padding: 12,
        borderRadius: 10,
        marginVertical: 6,
    },
    statusBadgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        fontWeight: 'bold',
        fontSize: 15,
    },
});
