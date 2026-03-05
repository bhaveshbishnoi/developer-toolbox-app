import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import CryptoJS from 'crypto-js';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const HashGenerator = () => {
    const [input, setInput] = useState('');
    const { addHistory } = useAppStore();

    const md5Output = input ? CryptoJS.MD5(input).toString() : '';
    const sha1Output = input ? CryptoJS.SHA1(input).toString() : '';
    const sha256Output = input ? CryptoJS.SHA256(input).toString() : '';
    const sha512Output = input ? CryptoJS.SHA512(input).toString() : '';

    useEffect(() => {
        if (input.length > 3) {
            const timeout = setTimeout(() => {
                addHistory({
                    toolId: 'HashGenerator',
                    input,
                    output: md5Output.substring(0, 10) + '...',
                    timestamp: Date.now()
                });
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [input]);

    return (
        <ScreenWrapper>
            <InputField
                label="Text to hash (Real-time)"
                value={input}
                onChangeText={setInput}
                multiline
                placeholder="Enter text..."
            />

            <OutputField label="MD5" value={md5Output} />
            <OutputField label="SHA-1" value={sha1Output} />
            <OutputField label="SHA-256" value={sha256Output} />
            <OutputField label="SHA-512" value={sha512Output} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({});
