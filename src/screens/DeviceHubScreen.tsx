import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { ToolCard } from '../components/ToolCard';
import { TOOLS } from '../utils/tools';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DeviceHubScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const nativeTools = TOOLS.filter((t) => t.isAndroidNative);

    return (
        <ScreenWrapper>
            {/* Hero Card */}
            <Surface style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
                <View style={styles.heroContent}>
                    <View style={[styles.heroIconBox, { backgroundColor: theme.colors.primaryContainer }]}>
                        <MaterialCommunityIcons name="android" size={32} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            Android Diagnostics Suite
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                            Hardware diagnostics, network analyzer, live sensors, QR toolkit, and package inspection.
                        </Text>
                    </View>
                </View>
            </Surface>

            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Core Android Modules (6 of 6)
            </Text>

            <View style={styles.grid}>
                {nativeTools.map((tool) => (
                    <ToolCard
                        key={tool.id}
                        id={tool.id}
                        title={tool.name}
                        description={tool.description}
                        icon={tool.icon}
                        badge={tool.badge}
                        onPress={() => navigation.navigate(tool.id as any)}
                    />
                ))}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    heroCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroIconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});

