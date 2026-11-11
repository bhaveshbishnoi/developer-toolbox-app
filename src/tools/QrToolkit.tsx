import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, AppState, AppStateStatus } from 'react-native';
import { Text, Surface, Button, TextInput, SegmentedButtons, useTheme, IconButton, Switch, Dialog, Portal } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { PrivacyNote } from '../components/PrivacyNote';

type Mode = 'generate' | 'scan';
type QrType = 'text' | 'url' | 'wifi' | 'contact';

export const QrToolkit = () => {
    const theme = useTheme();
    const [mode, setMode] = useState<Mode>('generate');
    const [qrType, setQrType] = useState<QrType>('text');

    // Generator inputs
    const [textInput, setTextInput] = useState('Hello from Developer Toolbox');
    const [urlInput, setUrlInput] = useState('https://github.com');
    // Wi-Fi inputs
    const [wifiSsid, setWifiSsid] = useState('MyHomeNetwork');
    const [wifiPass, setWifiPass] = useState('');
    const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
    const [wifiHidden, setWifiHidden] = useState(false);
    const [showWifiPass, setShowWifiPass] = useState(false);
    // Contact inputs
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactOrg, setContactOrg] = useState('');

    // Scanner state
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [torchOn, setTorchOn] = useState(false);
    const [confirmUrlDialog, setConfirmUrlDialog] = useState(false);
    const [urlToOpen, setUrlToOpen] = useState('');

    // Stop torch and scanner when leaving screen
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState.match(/inactive|background/)) {
                setTorchOn(false);
            }
        };
        const sub = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            sub.remove();
            setTorchOn(false);
        };
    }, []);

    // Build QR payload
    const getQrPayload = (): string => {
        switch (qrType) {
            case 'text':
                return textInput || ' ';
            case 'url': {
                const u = urlInput.trim();
                return u.startsWith('http') ? u : `https://${u}`;
            }
            case 'wifi':
                return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPass};H:${wifiHidden ? 'true' : 'false'};;`;
            case 'contact':
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nORG:${contactOrg}\nEND:VCARD`;
            default:
                return textInput;
        }
    };

    const payload = getQrPayload();

    const handleCopyPayload = async () => {
        if (payload) {
            await Clipboard.setStringAsync(payload);
            Alert.alert('Copied', 'QR code payload copied to clipboard');
        }
    };

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (scannedData === data) return; // Debounce duplicate events
        setScannedData(data);
    };

    const handleOpenScannedUrl = (url: string) => {
        setUrlToOpen(url);
        setConfirmUrlDialog(true);
    };

    const confirmOpenUrl = async () => {
        setConfirmUrlDialog(false);
        if (urlToOpen) {
            try {
                const supported = await Linking.canOpenURL(urlToOpen);
                if (supported) {
                    await Linking.openURL(urlToOpen);
                } else {
                    Alert.alert('Unable to open URL', urlToOpen);
                }
            } catch (e: any) {
                Alert.alert('Error', e.message);
            }
        }
    };

    return (
        <ScreenWrapper scrollable={mode === 'generate'}>
            <PrivacyNote note="All QR codes are generated and processed completely on-device. Camera is accessed only during active barcode scanning." />

            <SegmentedButtons
                value={mode}
                onValueChange={(val) => {
                    setMode(val as Mode);
                    setScannedData(null);
                    setTorchOn(false);
                }}
                buttons={[
                    { value: 'generate', label: 'Generate QR', icon: 'qrcode' },
                    { value: 'scan', label: 'Scan Code', icon: 'camera' },
                ]}
                style={styles.segmented}
                theme={{ colors: { secondaryContainer: theme.colors.primaryContainer, onSecondaryContainer: theme.colors.primary } }}
            />

            {/* --- GENERATOR MODE --- */}
            {mode === 'generate' && (
                <View>
                    <SegmentedButtons
                        value={qrType}
                        onValueChange={(val) => setQrType(val as QrType)}
                        buttons={[
                            { value: 'text', label: 'Text' },
                            { value: 'url', label: 'URL' },
                            { value: 'wifi', label: 'Wi-Fi' },
                            { value: 'contact', label: 'vCard' },
                        ]}
                        style={styles.typeSegmented}
                    />

                    {/* Inputs based on type */}
                    {qrType === 'text' && (
                        <TextInput
                            mode="outlined"
                            label="Plain Text"
                            value={textInput}
                            onChangeText={setTextInput}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />
                    )}

                    {qrType === 'url' && (
                        <TextInput
                            mode="outlined"
                            label="Website URL"
                            value={urlInput}
                            onChangeText={setUrlInput}
                            autoCapitalize="none"
                            placeholder="https://example.com"
                            style={styles.input}
                        />
                    )}

                    {qrType === 'wifi' && (
                        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                            <TextInput
                                mode="outlined"
                                label="Network SSID (Name)"
                                value={wifiSsid}
                                onChangeText={setWifiSsid}
                                style={styles.input}
                            />
                            <SegmentedButtons
                                value={wifiAuth}
                                onValueChange={(val) => setWifiAuth(val as any)}
                                buttons={[
                                    { value: 'WPA', label: 'WPA/WPA2' },
                                    { value: 'WEP', label: 'WEP' },
                                    { value: 'nopass', label: 'Open' },
                                ]}
                                style={styles.input}
                            />
                            {wifiAuth !== 'nopass' && (
                                <TextInput
                                    mode="outlined"
                                    label="Wi-Fi Password"
                                    value={wifiPass}
                                    onChangeText={setWifiPass}
                                    secureTextEntry={!showWifiPass}
                                    right={
                                        <TextInput.Icon
                                            icon={showWifiPass ? 'eye-off' : 'eye'}
                                            onPress={() => setShowWifiPass(!showWifiPass)}
                                        />
                                    }
                                    style={styles.input}
                                />
                            )}
                            <View style={styles.switchRow}>
                                <Text variant="bodyMedium">Hidden Network</Text>
                                <Switch value={wifiHidden} onValueChange={setWifiHidden} />
                            </View>
                        </Surface>
                    )}

                    {qrType === 'contact' && (
                        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                            <TextInput
                                mode="outlined"
                                label="Full Name"
                                value={contactName}
                                onChangeText={setContactName}
                                style={styles.input}
                            />
                            <TextInput
                                mode="outlined"
                                label="Phone Number"
                                value={contactPhone}
                                onChangeText={setContactPhone}
                                keyboardType="phone-pad"
                                style={styles.input}
                            />
                            <TextInput
                                mode="outlined"
                                label="Email"
                                value={contactEmail}
                                onChangeText={setContactEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                            />
                            <TextInput
                                mode="outlined"
                                label="Organization / Title"
                                value={contactOrg}
                                onChangeText={setContactOrg}
                                style={styles.input}
                            />
                        </Surface>
                    )}

                    {/* QR Code Preview Surface */}
                    <Surface style={[styles.qrPreviewCard, { backgroundColor: '#FFFFFF' }]}>
                        <QRCode
                            value={payload || 'DeveloperToolbox'}
                            size={200}
                            color="#000000"
                            backgroundColor="#FFFFFF"
                        />
                    </Surface>

                    <View style={styles.actionButtons}>
                        <Button mode="contained" icon="content-copy" onPress={handleCopyPayload} style={{ flex: 1 }}>
                            Copy Payload
                        </Button>
                    </View>
                </View>
            )}

            {/* --- SCANNER MODE --- */}
            {mode === 'scan' && (
                <View style={styles.scannerWrapper}>
                    {!permission?.granted ? (
                        <Surface style={[styles.permCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="camera-off" size={48} color={theme.colors.error} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 12 }}>
                                Camera Permission Required
                            </Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginVertical: 10 }}>
                                Developer Toolbox needs camera access to scan QR codes and barcodes directly from your phone.
                            </Text>
                            <Button mode="contained" onPress={requestPermission} style={{ marginTop: 8 }}>
                                Grant Camera Permission
                            </Button>
                        </Surface>
                    ) : (
                        <View style={styles.cameraContainer}>
                            <CameraView
                                style={StyleSheet.absoluteFillObject}
                                enableTorch={torchOn}
                                barcodeScannerSettings={{
                                    barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a'],
                                }}
                                onBarcodeScanned={handleBarcodeScanned}
                            />

                            {/* Overlay reticle */}
                            <View style={styles.reticleContainer}>
                                <View style={[styles.reticle, { borderColor: theme.colors.primary }]} />
                                <Text style={styles.reticleLabel}>Align QR or barcode inside frame</Text>
                            </View>

                            {/* Torch Toggle button */}
                            <View style={styles.scannerControls}>
                                <IconButton
                                    icon={torchOn ? 'flashlight' : 'flashlight-off'}
                                    mode="contained-tonal"
                                    size={24}
                                    iconColor={torchOn ? theme.colors.primary : theme.colors.onSurface}
                                    onPress={() => setTorchOn(!torchOn)}
                                />
                            </View>

                            {/* Scanned Result Card */}
                            {scannedData ? (
                                <Surface style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
                                    <View style={styles.resultHeader}>
                                        <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                            Code Detected
                                        </Text>
                                        <IconButton icon="close" size={18} onPress={() => setScannedData(null)} />
                                    </View>
                                    <Text selectable variant="bodyMedium" numberOfLines={4} style={{ fontFamily: 'monospace' }}>
                                        {scannedData}
                                    </Text>
                                    <View style={styles.resultActions}>
                                        <Button
                                            mode="contained-tonal"
                                            icon="content-copy"
                                            onPress={() => Clipboard.setStringAsync(scannedData)}
                                            style={{ flex: 1, marginRight: 8 }}
                                        >
                                            Copy
                                        </Button>
                                        {scannedData.startsWith('http') && (
                                            <Button
                                                mode="contained"
                                                icon="open-in-new"
                                                onPress={() => handleOpenScannedUrl(scannedData)}
                                                style={{ flex: 1 }}
                                            >
                                                Open URL
                                            </Button>
                                        )}
                                    </View>
                                </Surface>
                            ) : null}
                        </View>
                    )}
                </View>
            )}

            {/* Confirm URL Dialog */}
            <Portal>
                <Dialog visible={confirmUrlDialog} onDismiss={() => setConfirmUrlDialog(false)}>
                    <Dialog.Title>Open External Link?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                            You are about to open this destination in your web browser:
                        </Text>
                        <Text variant="bodySmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            {urlToOpen}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setConfirmUrlDialog(false)}>Cancel</Button>
                        <Button mode="contained" onPress={confirmOpenUrl}>
                            Open Link
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    segmented: {
        marginBottom: 14,
    },
    typeSegmented: {
        marginBottom: 14,
    },
    input: {
        marginBottom: 10,
    },
    card: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    qrPreviewCard: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 14,
        alignSelf: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    scannerWrapper: {
        flex: 1,
        minHeight: 460,
    },
    permCard: {
        padding: 30,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
    },
    cameraContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 460,
    },
    reticleContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reticle: {
        width: 240,
        height: 240,
        borderRadius: 16,
        borderWidth: 2,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    reticleLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        marginTop: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    scannerControls: {
        position: 'absolute',
        top: 14,
        right: 14,
    },
    resultCard: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        padding: 14,
        borderRadius: 14,
        elevation: 4,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultActions: {
        flexDirection: 'row',
        marginTop: 10,
    },
});

