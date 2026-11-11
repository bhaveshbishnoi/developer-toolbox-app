import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, SegmentedButtons, useTheme, Chip } from 'react-native-paper';
import { v4 as uuidv4, v1 as uuidv1 } from 'uuid';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const UuidGenerator = () => {
    const [count, setCount] = useState('5');
    const [version, setVersion] = useState<'v4' | 'v1'>('v4');
    const [uppercase, setUppercase] = useState(false);
    const [noHyphens, setNoHyphens] = useState(false);
    const [useBraces, setUseBraces] = useState(false);
    const [output, setOutput] = useState('');

    const { addHistory } = useAppStore();
    const theme = useTheme();

    const handleGenerate = () => {
        const num = parseInt(count, 10);
        const uuids = Array.from({ length: num }, () => {
            let id = version === 'v4' ? uuidv4() : uuidv1();
            if (noHyphens) id = id.replace(/-/g, '');
            if (uppercase) id = id.toUpperCase();
            if (useBraces) id = `{${id}}`;
            return id;
        });

        const result = uuids.join('\n');
        setOutput(result);

        addHistory({
            toolId: 'UuidGenerator',
            input: `Generated ${num} UUIDs (${version.toUpperCase()})`,
            output: uuids[0] + (num > 1 ? ` (+${num - 1} more)` : ''),
            timestamp: Date.now(),
        });
    };

    return (
        <ScreenWrapper>
            <Text variant="titleSmall" style={{ marginBottom: 8, fontWeight: 'bold' }}>
                Generation Parameters
            </Text>

            <SegmentedButtons
                value={version}
                onValueChange={(val) => setVersion(val as any)}
                buttons={[
                    { value: 'v4', label: 'UUID v4 (Random)' },
                    { value: 'v1', label: 'UUID v1 (Timestamp)' },
                ]}
                style={{ marginBottom: 12 }}
            />

            <SegmentedButtons
                value={count}
                onValueChange={setCount}
                buttons={[
                    { value: '1', label: '1' },
                    { value: '5', label: '5' },
                    { value: '10', label: '10' },
                    { value: '25', label: '25' },
                ]}
                style={styles.segmented}
                theme={{ colors: { secondaryContainer: theme.colors.primaryContainer, onSecondaryContainer: theme.colors.primary } }}
            />

            {/* Formatting toggles */}
            <View style={styles.togglesRow}>
                <Chip
                    selected={uppercase}
                    onPress={() => setUppercase(!uppercase)}
                    style={styles.chip}
                >
                    UPPERCASE
                </Chip>
                <Chip
                    selected={noHyphens}
                    onPress={() => setNoHyphens(!noHyphens)}
                    style={styles.chip}
                >
                    No Hyphens
                </Chip>
                <Chip
                    selected={useBraces}
                    onPress={() => setUseBraces(!useBraces)}
                    style={styles.chip}
                >
                    Braces {'{ }'}
                </Chip>
            </View>

            <Button
                mode="contained"
                icon="identifier"
                onPress={handleGenerate}
                style={styles.button}
            >
                Generate UUIDs
            </Button>

            <OutputField label="Generated UUID(s)" value={output} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    segmented: {
        marginBottom: 12,
    },
    togglesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        height: 36,
    },
    button: {
        marginVertical: 10,
    },
});
