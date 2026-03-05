import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, SegmentedButtons, useTheme } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { OutputField } from '../components/OutputField';
import { useAppStore } from '../store';

export const UuidGenerator = () => {
    const [count, setCount] = useState('1');
    const [output, setOutput] = useState('');
    const { addHistory } = useAppStore();
    const theme = useTheme();

    const handleGenerate = () => {
        const num = parseInt(count, 10);
        const uuids = Array.from({ length: num }, () => uuidv4());
        const result = uuids.join('\n');
        setOutput(result);

        addHistory({
            toolId: 'UuidGenerator',
            input: `Generated ${num} UUIDs`,
            output: result,
            timestamp: Date.now()
        });
    };

    return (
        <ScreenWrapper>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>Number of UUIDs to generate</Text>
            <SegmentedButtons
                value={count}
                onValueChange={setCount}
                buttons={[
                    { value: '1', label: '1' },
                    { value: '5', label: '5' },
                    { value: '10', label: '10' },
                    { value: '20', label: '20' },
                ]}
                style={styles.segmented}
                theme={{ colors: { secondaryContainer: theme.colors.primary, onSecondaryContainer: theme.colors.background } }}
            />

            <Button mode="contained" onPress={handleGenerate} style={styles.button}>
                Generate UUID(s)
            </Button>

            <OutputField label="UUID Output" value={output} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    segmented: {
        marginBottom: 24,
    },
    button: {
        marginVertical: 12,
    }
});
