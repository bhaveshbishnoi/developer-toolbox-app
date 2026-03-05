import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const ColorConverter = () => {
    const [input, setInput] = useState('');
    const [hexOutput, setHexOutput] = useState('');
    const [rgbOutput, setRgbOutput] = useState('');
    const [hslOutput, setHslOutput] = useState('');
    const [previewColor, setPreviewColor] = useState('transparent');
    const [error, setError] = useState('');

    const theme = useTheme();
    const { addHistory } = useAppStore();

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    const handleConvert = () => {
        setError('');
        let c = input.trim().toLowerCase();

        if (c.startsWith('#') || /^[0-9a-f]{6}$/i.test(c)) {
            if (!c.startsWith('#')) c = '#' + c;
            const rgb = hexToRgb(c);
            if (rgb) {
                setHexOutput(c.toUpperCase());
                setRgbOutput(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                setHslOutput(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
                setPreviewColor(c);
                addHistory({ toolId: 'ColorConverter', input, output: c.toUpperCase(), timestamp: Date.now() });
                return;
            }
        }

        setError('Currently only HEX format is supported. Ex: #FF5733');
    };

    return (
        <ScreenWrapper>
            <View style={[styles.preview, { backgroundColor: previewColor, borderColor: theme.colors.outline }]} />

            <InputField
                label="Color Input (HEX)"
                value={input}
                onChangeText={setInput}
                placeholder="#FF5733"
            />

            <Button mode="contained" onPress={handleConvert} style={styles.button} disabled={!input}>
                Convert
            </Button>

            <OutputField label="HEX" value={hexOutput} />
            <OutputField label="RGB" value={rgbOutput} />
            <OutputField label="HSL" value={hslOutput} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    preview: {
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    button: {
        marginVertical: 12,
    }
});
