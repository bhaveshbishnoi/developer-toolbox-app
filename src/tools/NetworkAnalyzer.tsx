import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button, TextInput, SegmentedButtons, useTheme, ActivityIndicator, IconButton, Chip } from 'react-native-paper';
import * as Network from 'expo-network';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { PrivacyNote } from '../components/PrivacyNote';

type TabKey = 'overview' | 'public_ip' | 'dns' | 'ping';

export const NetworkAnalyzer = () => {
    const theme = useTheme();
    const [currentTab, setCurrentTab] = useState<TabKey>('overview');

    // Overview state
    const [networkState, setNetworkState] = useState<Network.NetworkState | null>(null);
    const [localIp, setLocalIp] = useState<string>('Detecting...');
    const [refreshing, setRefreshing] = useState(false);

    // Public IP state
    const [publicIpV4, setPublicIpV4] = useState<string>('');
    const [publicIpTime, setPublicIpTime] = useState<string>('');
    const [loadingPublicIp, setLoadingPublicIp] = useState(false);
    const [publicIpError, setPublicIpError] = useState('');

    // DNS state
    const [dnsHost, setDnsHost] = useState('google.com');
    const [dnsRecords, setDnsRecords] = useState<{ type: string; ip: string; ttl: number }[]>([]);
    const [dnsDuration, setDnsDuration] = useState<number | null>(null);
    const [dnsLoading, setDnsLoading] = useState(false);
    const [dnsError, setDnsError] = useState('');

    // Ping state
    const [pingTarget, setPingTarget] = useState('1.1.1.1');
    const [pingResults, setPingResults] = useState<{ seq: number; latency: number; ok: boolean }[]>([]);
    const [pingRunning, setPingRunning] = useState(false);
    const [pingStats, setPingStats] = useState<{ min: number; max: number; avg: number; loss: number } | null>(null);

    // Load local network overview
    const loadOverview = async () => {
        setRefreshing(true);
        try {
            const state = await Network.getNetworkStateAsync();
            setNetworkState(state);

            const ip = await Network.getIpAddressAsync();
            setLocalIp(ip || 'Not assigned / restricted');
        } catch {
            setLocalIp('Not reported');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOverview();
    }, []);

    // Public IP Fetch
    const fetchPublicIp = async () => {
        setLoadingPublicIp(true);
        setPublicIpError('');
        try {
            const res = await axios.get('https://api.ipify.org?format=json', { timeout: 6000 });
            if (res.data?.ip) {
                setPublicIpV4(res.data.ip);
                setPublicIpTime(new Date().toLocaleTimeString());
            } else {
                throw new Error('No IP returned');
            }
        } catch (e: any) {
            setPublicIpError(e.message || 'Unable to reach public IP echo service');
        } finally {
            setLoadingPublicIp(false);
        }
    };

    // DNS Lookup using Cloudflare DoH (DNS-over-HTTPS)
    const runDnsLookup = async () => {
        if (!dnsHost.trim()) return;
        setDnsLoading(true);
        setDnsError('');
        setDnsRecords([]);
        setDnsDuration(null);

        const startTime = Date.now();
        const cleanHost = dnsHost.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

        try {
            // Resolve A records (IPv4)
            const aPromise = axios.get(`https://cloudflare-dns.com/dns-query?name=${cleanHost}&type=A`, {
                headers: { Accept: 'application/dns-json' },
                timeout: 5000,
            });
            // Resolve AAAA records (IPv6)
            const aaaaPromise = axios.get(`https://cloudflare-dns.com/dns-query?name=${cleanHost}&type=AAAA`, {
                headers: { Accept: 'application/dns-json' },
                timeout: 5000,
            });

            const [aRes, aaaaRes] = await Promise.allSettled([aPromise, aaaaPromise]);
            const elapsed = Date.now() - startTime;
            setDnsDuration(elapsed);

            const collected: { type: string; ip: string; ttl: number }[] = [];

            if (aRes.status === 'fulfilled' && aRes.value.data?.Answer) {
                aRes.value.data.Answer.forEach((item: any) => {
                    if (item.data) {
                        collected.push({ type: 'A (IPv4)', ip: item.data, ttl: item.TTL });
                    }
                });
            }

            if (aaaaRes.status === 'fulfilled' && aaaaRes.value.data?.Answer) {
                aaaaRes.value.data.Answer.forEach((item: any) => {
                    if (item.data) {
                        collected.push({ type: 'AAAA (IPv6)', ip: item.data, ttl: item.TTL });
                    }
                });
            }

            if (collected.length === 0) {
                setDnsError(`No A/AAAA records returned for "${cleanHost}" (NXDOMAIN or restricted).`);
            } else {
                setDnsRecords(collected);
            }
        } catch (err: any) {
            setDnsError(err.message || 'DNS resolution timed out or failed.');
        } finally {
            setDnsLoading(false);
        }
    };

    // Bounded Ping / Latency Test (4 bounded probes)
    const runPingTest = async () => {
        if (pingRunning) return;
        setPingRunning(true);
        setPingResults([]);
        setPingStats(null);

        const target = pingTarget.trim();
        const probeTarget = target.startsWith('http') ? target : `https://${target}`;
        const probeCount = 4;
        const results: { seq: number; latency: number; ok: boolean }[] = [];

        for (let i = 1; i <= probeCount; i++) {
            const start = Date.now();
            try {
                // Send bounded HEAD probe with timestamp cache-buster
                await axios.head(`${probeTarget}?_ping=${Date.now()}`, {
                    timeout: 2500,
                    validateStatus: () => true, // accept any HTTP response as a reachability success
                });
                const latency = Date.now() - start;
                results.push({ seq: i, latency, ok: true });
            } catch {
                results.push({ seq: i, latency: 0, ok: false });
            }
            setPingResults([...results]);
            // Small pause between probes
            await new Promise((r) => setTimeout(r, 200));
        }

        const successful = results.filter((r) => r.ok);
        if (successful.length > 0) {
            const latencies = successful.map((r) => r.latency);
            const min = Math.min(...latencies);
            const max = Math.max(...latencies);
            const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
            const loss = Math.round(((probeCount - successful.length) / probeCount) * 100);
            setPingStats({ min, max, avg, loss });
        } else {
            setPingStats({ min: 0, max: 0, avg: 0, loss: 100 });
        }
        setPingRunning(false);
    };

    const getNetworkTypeName = (type?: Network.NetworkStateType) => {
        switch (type) {
            case Network.NetworkStateType.WIFI:
                return 'Wi-Fi Network';
            case Network.NetworkStateType.CELLULAR:
                return 'Cellular Data';
            case Network.NetworkStateType.ETHERNET:
                return 'Ethernet Connection';
            case Network.NetworkStateType.VPN:
                return 'VPN Interface';
            case Network.NetworkStateType.NONE:
                return 'No Network Connected';
            default:
                return 'Unknown / Other';
        }
    };

    return (
        <ScreenWrapper>
            <PrivacyNote note="Local network diagnostics run on-device. Public IP & DNS lookups query public echo endpoints only upon explicit user tap." />

            <SegmentedButtons
                value={currentTab}
                onValueChange={(val) => setCurrentTab(val as TabKey)}
                buttons={[
                    { value: 'overview', label: 'Overview' },
                    { value: 'public_ip', label: 'Public IP' },
                    { value: 'dns', label: 'DNS' },
                    { value: 'ping', label: 'Ping' },
                ]}
                style={styles.segmented}
                theme={{ colors: { secondaryContainer: theme.colors.primaryContainer, onSecondaryContainer: theme.colors.primary } }}
            />

            {/* TAB 1: OVERVIEW */}
            {currentTab === 'overview' && (
                <View>
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="access-point-network" size={22} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 8, flex: 1 }}>
                                Active Interface Status
                            </Text>
                            <IconButton icon="refresh" size={20} iconColor={theme.colors.primary} onPress={loadOverview} />
                        </View>

                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                Connectivity State
                            </Text>
                            <Text
                                variant="bodyMedium"
                                style={{
                                    fontWeight: 'bold',
                                    color: networkState?.isConnected ? theme.colors.tertiary : theme.colors.error,
                                }}
                            >
                                {networkState?.isConnected ? 'Connected' : 'Disconnected'}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                Internet Validated
                            </Text>
                            <Text
                                variant="bodyMedium"
                                style={{
                                    fontWeight: 'bold',
                                    color: networkState?.isInternetReachable ? theme.colors.tertiary : theme.colors.error,
                                }}
                            >
                                {networkState?.isInternetReachable ? 'Reachable' : 'No Internet Access'}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                Interface Type
                            </Text>
                            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                                {getNetworkTypeName(networkState?.type)}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                Local Device IP
                            </Text>
                            <Text selectable variant="bodyMedium" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                {localIp}
                            </Text>
                        </View>
                    </Surface>

                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 6 }}>
                            Wi-Fi & Privacy Notice
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
                            Modern Android restricts access to Wi-Fi SSID, BSSID, and MAC addresses without runtime location permissions and location services enabled. Developer Toolbox adheres strictly to least-privilege principles and reports verified connection states.
                        </Text>
                    </Surface>
                </View>
            )}

            {/* TAB 2: PUBLIC IP */}
            {currentTab === 'public_ip' && (
                <View>
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="earth" size={22} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 8 }}>
                                Public IPv4 Address
                            </Text>
                        </View>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
                            Queries the reputable public IP-echo endpoint (api.ipify.org) over HTTPS.
                        </Text>

                        {publicIpV4 ? (
                            <View style={styles.ipDisplayBox}>
                                <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold', fontFamily: 'monospace' }}>
                                    {publicIpV4}
                                </Text>
                                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                    Last checked: {publicIpTime}
                                </Text>
                            </View>
                        ) : null}

                        {publicIpError ? (
                            <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 12 }}>
                                {publicIpError}
                            </Text>
                        ) : null}

                        <View style={styles.buttonRow}>
                            <Button
                                mode="contained"
                                icon="radar"
                                onPress={fetchPublicIp}
                                loading={loadingPublicIp}
                                disabled={loadingPublicIp}
                                style={{ flex: 1 }}
                            >
                                {publicIpV4 ? 'Refresh Public IP' : 'Detect Public IP'}
                            </Button>
                            {publicIpV4 ? (
                                <IconButton
                                    icon="content-copy"
                                    iconColor={theme.colors.primary}
                                    onPress={() => Clipboard.setStringAsync(publicIpV4)}
                                />
                            ) : null}
                        </View>
                    </Surface>
                </View>
            )}

            {/* TAB 3: DNS LOOKUP */}
            {currentTab === 'dns' && (
                <View>
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            DNS Resolver (DoH)
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                            Resolves A (IPv4) & AAAA (IPv6) records via secure Cloudflare DNS-over-HTTPS.
                        </Text>

                        <TextInput
                            mode="outlined"
                            label="Domain or Hostname"
                            value={dnsHost}
                            onChangeText={setDnsHost}
                            autoCapitalize="none"
                            placeholder="example.com"
                            style={{ marginBottom: 12 }}
                        />

                        <Button
                            mode="contained"
                            icon="magnify"
                            onPress={runDnsLookup}
                            loading={dnsLoading}
                            disabled={dnsLoading || !dnsHost.trim()}
                        >
                            Resolve DNS
                        </Button>

                        {dnsError ? (
                            <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 12 }}>
                                {dnsError}
                            </Text>
                        ) : null}

                        {dnsDuration !== null && (
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
                                Lookup completed in {dnsDuration} ms
                            </Text>
                        )}

                        {dnsRecords.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                {dnsRecords.map((r, i) => (
                                    <View key={i} style={[styles.dnsRow, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <View>
                                            <Chip compact textStyle={{ fontSize: 10 }}>
                                                {r.type}
                                            </Chip>
                                        </View>
                                        <Text selectable variant="bodyMedium" style={{ fontFamily: 'monospace', fontWeight: 'bold', flex: 1, marginLeft: 10 }}>
                                            {r.ip}
                                        </Text>
                                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                            TTL: {r.ttl}s
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Surface>
                </View>
            )}

            {/* TAB 4: PING TEST */}
            {currentTab === 'ping' && (
                <View>
                    <Surface style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            Bounded Latency Probe
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                            Sends 4 HTTP reachability probes with strict timeouts to measure round-trip latency.
                        </Text>

                        <TextInput
                            mode="outlined"
                            label="Target Host or IP"
                            value={pingTarget}
                            onChangeText={setPingTarget}
                            autoCapitalize="none"
                            placeholder="1.1.1.1 or google.com"
                            style={{ marginBottom: 12 }}
                        />

                        <Button
                            mode="contained"
                            icon="pulse"
                            onPress={runPingTest}
                            loading={pingRunning}
                            disabled={pingRunning || !pingTarget.trim()}
                        >
                            Start Latency Test (4 probes)
                        </Button>

                        {pingResults.length > 0 && (
                            <View style={{ marginTop: 16 }}>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 6 }}>
                                    Probe Responses:
                                </Text>
                                {pingResults.map((p) => (
                                    <View key={p.seq} style={[styles.probeRow, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                                            Probe #{p.seq}
                                        </Text>
                                        <Text
                                            variant="bodyMedium"
                                            style={{
                                                fontWeight: 'bold',
                                                fontFamily: 'monospace',
                                                color: p.ok ? theme.colors.tertiary : theme.colors.error,
                                            }}
                                        >
                                            {p.ok ? `${p.latency} ms` : 'Timed out / Blocked'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {pingStats && (
                            <View style={[styles.statsBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 4 }}>
                                    ROUND-TRIP STATISTICS
                                </Text>
                                <Text variant="bodySmall">
                                    Min: {pingStats.min} ms • Max: {pingStats.max} ms • Avg: {pingStats.avg} ms • Loss: {pingStats.loss}%
                                </Text>
                            </View>
                        )}
                    </Surface>
                </View>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    segmented: {
        marginBottom: 16,
    },
    card: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ipDisplayBox: {
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        marginBottom: 16,
    },
    dnsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
    },
    probeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
    },
    statsBox: {
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
});

