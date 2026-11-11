import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, useTheme, Chip, TextInput } from 'react-native-paper';
import CryptoJS from 'crypto-js';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const HashGenerator = () => {
    const [input, setInput] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [useHmac, setUseHmac] = useState(false);
    const [uppercase, setUppercase] = useState(false);

    const theme = useTheme();
    const { addHistory } = useAppStore();

    const formatHash = (hashObj: any): string => {
        if (!input) return '';
        const str = hashObj.toString();
        return uppercase ? str.toUpperCase() : str.toLowerCase();
    };

    let md5 = '';
    let sha1 = '';
    let sha256 = '';
    let sha512 = '';

    if (input) {
        if (useHmac && secretKey) {
            md5 = formatHash(CryptoJS.HmacMD5(input, secretKey));
            sha1 = formatHash(CryptoJS.HmacSHA1(input, secretKey));
            sha256 = formatHash(CryptoJS.HmacSHA256(input, secretKey));
            sha512 = formatHash(CryptoJS.HmacSHA512(input, secretKey));
        } else {
            md5 = formatHash(CryptoJS.MD5(input));
            sha1 = formatHash(CryptoJS.SHA1(input));
            sha256 = formatHash(CryptoJS.SHA256(input));
            sha512 = formatHash(CryptoJS.SHA512(input));
        }
    }

    const handleSaveToHistory = () => {
        if (!input) return;
        addHistory({
            toolId: 'HashGenerator',
            input: input.slice(0, 50),
            output: sha256,
            timestamp: Date.now(),
        });
    };

    return (
        <ScreenWrapper>
            <View style={styles.topOptions}>
                <Chip
                    selected={useHmac}
                    onPress={() => setUseHmac(!useHmac)}
                    style={styles.chip}
                >
                    HMAC Mode (Secret Key)
                </Chip>
                <Chip
                    selected={uppercase}
                    onPress={() => setUppercase(!uppercase)}
                    style={styles.chip}
                >
                    UPPERCASE
                </Chip>
            </View>

            {useHmac && (
                <TextInput
                    mode="outlined"
                    label="HMAC Secret Key"
                    value={secretKey}
                    onChangeText={setSecretKey}
                    placeholder="Enter secret key..."
                    style={{ marginBottom: 12 }}
                />
            )}

            <InputField
                label="Text to Hash"
                value={input}
                onChangeText={setInput}
                multiline
                monospace
                placeholder="Enter string to generate cryptographic hashes..."
                sampleText="The quick brown fox jumps over the lazy dog"
            />

            {input ? (
                <Button
                    mode="contained-tonal"
                    icon="bookmark-outline"
                    onPress={handleSaveToHistory}
                    style={{ marginVertical: 6 }}
                >
                    Save Hashes to History
                </Button>
            ) : null}

            <OutputField label={useHmac ? 'HMAC-MD5 (128-bit)' : 'MD5 (128-bit)'} value={md5} />
            <OutputField label={useHmac ? 'HMAC-SHA1 (160-bit)' : 'SHA-1 (160-bit)'} value={sha1} />
            <OutputField label={useHmac ? 'HMAC-SHA256 (256-bit)' : 'SHA-256 (Standard)'} value={sha256} />
            <OutputField label={useHmac ? 'HMAC-SHA512 (512-bit)' : 'SHA-512 (High Security)'} value={sha512} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    topOptions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    chip: {
        height: 36,
    },
});
