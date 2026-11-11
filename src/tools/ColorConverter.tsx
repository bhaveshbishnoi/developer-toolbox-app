import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text, useTheme, Chip } from 'react-native-paper';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

const COLOR_SWATCHES = [
    { name: 'Sky Blue', hex: '#38BDF8' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Indigo', hex: '#6366F1' },
    { name: 'Amber', hex: '#F59E0B' },
    { name: 'Rose', hex: '#F43F5E' },
    { name: 'Deep Slate', hex: '#0F172A' },
];

export const ColorConverter = () => {
    const [input, setInput] = useState('#38BDF8');
    const [hexOutput, setHexOutput] = useState('#38BDF8');
    const [rgbOutput, setRgbOutput] = useState('rgb(56, 189, 248)');
    const [rgbaOutput, setRgbaOutput] = useState('rgba(56, 189, 248, 1)');
    const [hslOutput, setHslOutput] = useState('hsl(198, 93%, 60%)');
    const [luminance, setLuminance] = useState<number>(0.45);
    const [previewColor, setPreviewColor] = useState('#38BDF8');
    const [error, setError] = useState('');

    const theme = useTheme();
    const { addHistory } = useAppStore();

    const parseColor = (str: string) => {
        let clean = str.trim().toLowerCase();
        let r = 0, g = 0, b = 0, a = 1;

        // Check HEX
        if (clean.startsWith('#') || /^[0-9a-f]{3,8}$/i.test(clean)) {
            if (!clean.startsWith('#')) clean = '#' + clean;
            if (clean.length === 4) {
                // #RGB -> #RRGGBB
                r = parseInt(clean[1] + clean[1], 16);
                g = parseInt(clean[2] + clean[2], 16);
                b = parseInt(clean[3] + clean[3], 16);
            } else if (clean.length === 7) {
                // #RRGGBB
                r = parseInt(clean.slice(1, 3), 16);
                g = parseInt(clean.slice(3, 5), 16);
                b = parseInt(clean.slice(5, 7), 16);
            } else if (clean.length === 9) {
                // #RRGGBBAA
                r = parseInt(clean.slice(1, 3), 16);
                g = parseInt(clean.slice(3, 5), 16);
                b = parseInt(clean.slice(5, 7), 16);
                a = Math.round((parseInt(clean.slice(7, 9), 16) / 255) * 100) / 100;
            } else {
                throw new Error('Invalid HEX format. Use #RGB, #RRGGBB, or #RRGGBBAA');
            }
        } else if (clean.startsWith('rgb')) {
            const match = clean.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/);
            if (!match) throw new Error('Invalid RGB(A) format. Example: rgb(56, 189, 248)');
            r = parseInt(match[1], 10);
            g = parseInt(match[2], 10);
            b = parseInt(match[3], 10);
            if (match[4] !== undefined) a = parseFloat(match[4]);
        } else if (clean.startsWith('hsl')) {
            const match = clean.match(/hsla?\((\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?(?:\s*,\s*([\d.]+))?\)/);
            if (!match) throw new Error('Invalid HSL(A) format. Example: hsl(198, 93%, 60%)');
            const h = parseInt(match[1], 10) / 360;
            const s = parseInt(match[2], 10) / 100;
            const l = parseInt(match[3], 10) / 100;
            if (match[4] !== undefined) a = parseFloat(match[4]);

            // HSL to RGB
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
            g = Math.round(hue2rgb(p, q, h) * 255);
            b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
        } else {
            throw new Error('Unsupported format. Enter HEX (#38bdf8), RGB (rgb(56, 189, 248)) or HSL.');
        }

        return { r, g, b, a };
    };

    const handleConvert = (colorStr = input) => {
        try {
            const { r, g, b, a } = parseColor(colorStr);
            const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
            const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

            // RGB to HSL
            const rn = r / 255, gn = g / 255, bn = b / 255;
            const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
            let h = 0, s = 0, l = (max + min) / 2;

            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
                    case gn: h = (bn - rn) / d + 2; break;
                    case bn: h = (rn - gn) / d + 4; break;
                }
                h /= 6;
            }

            const hslStr = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
            const rgbStr = `rgb(${r}, ${g}, ${b})`;
            const rgbaStr = `rgba(${r}, ${g}, ${b}, ${a})`;

            // Relative luminance calculation for WCAG contrast
            const lum = 0.2126 * rn + 0.7152 * gn + 0.0722 * bn;

            setHexOutput(hex);
            setRgbOutput(rgbStr);
            setRgbaOutput(rgbaStr);
            setHslOutput(hslStr);
            setLuminance(lum);
            setPreviewColor(rgbaStr);
            setError('');

            addHistory({
                toolId: 'ColorConverter',
                input: colorStr,
                output: hex,
                timestamp: Date.now(),
            });
        } catch (e: any) {
            setError(e.message || 'Color parse error');
        }
    };

    return (
        <ScreenWrapper>
            {/* Live Color Preview Block */}
            <View
                style={[
                    styles.previewCard,
                    {
                        backgroundColor: previewColor,
                        borderColor: theme.colors.outline,
                    },
                ]}
            >
                <View style={styles.previewMetaRow}>
                    <Text
                        variant="titleMedium"
                        style={{
                            fontWeight: 'bold',
                            color: luminance > 0.5 ? '#000000' : '#FFFFFF',
                        }}
                    >
                        {hexOutput}
                    </Text>
                    <Text
                        variant="bodySmall"
                        style={{
                            color: luminance > 0.5 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                        }}
                    >
                        Best text: {luminance > 0.5 ? 'Black' : 'White'}
                    </Text>
                </View>
            </View>

            {/* Quick Swatches */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.swatchRow}>
                {COLOR_SWATCHES.map((s) => (
                    <TouchableOpacity
                        key={s.name}
                        onPress={() => {
                            setInput(s.hex);
                            handleConvert(s.hex);
                        }}
                        style={[styles.swatchPill, { backgroundColor: s.hex }]}
                    >
                        <Text style={styles.swatchText}>{s.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <InputField
                label="Color Value (HEX, RGB, or HSL)"
                value={input}
                onChangeText={(t) => {
                    setInput(t);
                    if (error) setError('');
                }}
                placeholder="#38BDF8 or rgb(56, 189, 248)"
            />

            <Button
                mode="contained"
                icon="palette"
                onPress={() => handleConvert()}
                style={styles.convertBtn}
                disabled={!input.trim()}
            >
                Convert Color
            </Button>

            {/* FIX: RENDER ERROR MESSAGE PROPERLY */}
            {error ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {error}
                </Text>
            ) : null}

            <OutputField label="HEX Format" value={hexOutput} />
            <OutputField label="RGB Format" value={rgbOutput} />
            <OutputField label="RGBA Format" value={rgbaOutput} />
            <OutputField label="HSL Format" value={hslOutput} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    previewCard: {
        height: 110,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
        padding: 16,
        justifyContent: 'flex-end',
    },
    previewMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    swatchRow: {
        marginBottom: 12,
    },
    swatchPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
    },
    swatchText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    convertBtn: {
        marginVertical: 10,
    },
    errorText: {
        marginVertical: 6,
        fontWeight: 'bold',
    },
});
