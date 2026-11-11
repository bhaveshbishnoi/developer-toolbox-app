import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MainTabParamList, RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { DeviceHubScreen } from '../screens/DeviceHubScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAppStore } from '../store';

// Existing 10 tools
import { JsonFormatter } from '../tools/JsonFormatter';
import { Base64Encoder } from '../tools/Base64Encoder';
import { JwtDecoder } from '../tools/JwtDecoder';
import { RegexTester } from '../tools/RegexTester';
import { ColorConverter } from '../tools/ColorConverter';
import { HashGenerator } from '../tools/HashGenerator';
import { ApiTester } from '../tools/ApiTester';
import { UuidGenerator } from '../tools/UuidGenerator';
import { TimestampConverter } from '../tools/TimestampConverter';
import { UrlEncoder } from '../tools/UrlEncoder';

// Six New Android Feature Modules
import { DeviceInfo } from '../tools/DeviceInfo';
import { SensorTester } from '../tools/SensorTester';
import { NetworkAnalyzer } from '../tools/NetworkAnalyzer';
import { QrToolkit } from '../tools/QrToolkit';
import { HardwareTester } from '../tools/HardwareTester';
import { AppInspector } from '../tools/AppInspector';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabs = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.onSurface,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.outline,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
                    ),
                    title: 'Dashboard',
                }}
            />
            <Tab.Screen
                name="DeviceHub"
                component={DeviceHubScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="android" color={color} size={size} />
                    ),
                    title: 'Android Tools',
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="heart-outline" color={color} size={size} />
                    ),
                    title: 'Favorites',
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="history" color={color} size={size} />
                    ),
                    title: 'History',
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
                    ),
                    title: 'Settings',
                }}
            />
        </Tab.Navigator>
    );
};

const HeaderRight = ({ toolId }: { toolId: string }) => {
    const { favorites, toggleFavorite } = useAppStore();
    const theme = useTheme();
    const isFav = favorites.includes(toolId);
    return (
        <IconButton
            icon={isFav ? 'heart' : 'heart-outline'}
            iconColor={isFav ? theme.colors.error : theme.colors.onSurface}
            size={22}
            onPress={() => toggleFavorite(toolId)}
        />
    );
};

export const RootNavigator = () => {
    const theme = useTheme();

    const screenOpts = (title: string, toolId: string) => ({
        title,
        headerRight: () => <HeaderRight toolId={toolId} />,
    });

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.onSurface,
                headerTitleStyle: { fontWeight: 'bold', fontSize: 17 },
            }}
        >
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

            {/* 6 New Android Modules */}
            <Stack.Screen name="DeviceInfo" component={DeviceInfo} options={screenOpts('Device Information', 'DeviceInfo')} />
            <Stack.Screen name="SensorTester" component={SensorTester} options={screenOpts('Sensor Tester', 'SensorTester')} />
            <Stack.Screen name="NetworkAnalyzer" component={NetworkAnalyzer} options={screenOpts('Network Analyzer', 'NetworkAnalyzer')} />
            <Stack.Screen name="QrToolkit" component={QrToolkit} options={screenOpts('QR Code Toolkit', 'QrToolkit')} />
            <Stack.Screen name="HardwareTester" component={HardwareTester} options={screenOpts('Hardware Tester', 'HardwareTester')} />
            <Stack.Screen name="AppInspector" component={AppInspector} options={screenOpts('App Inspector', 'AppInspector')} />

            {/* 10 Existing Tools */}
            <Stack.Screen name="JsonFormatter" component={JsonFormatter} options={screenOpts('JSON Formatter', 'JsonFormatter')} />
            <Stack.Screen name="Base64Encoder" component={Base64Encoder} options={screenOpts('Base64 Encoder', 'Base64Encoder')} />
            <Stack.Screen name="JwtDecoder" component={JwtDecoder} options={screenOpts('JWT Decoder', 'JwtDecoder')} />
            <Stack.Screen name="RegexTester" component={RegexTester} options={screenOpts('Regex Tester', 'RegexTester')} />
            <Stack.Screen name="ColorConverter" component={ColorConverter} options={screenOpts('Color Converter', 'ColorConverter')} />
            <Stack.Screen name="HashGenerator" component={HashGenerator} options={screenOpts('Hash Generator', 'HashGenerator')} />
            <Stack.Screen name="ApiTester" component={ApiTester} options={screenOpts('API Tester', 'ApiTester')} />
            <Stack.Screen name="UuidGenerator" component={UuidGenerator} options={screenOpts('UUID Generator', 'UuidGenerator')} />
            <Stack.Screen name="TimestampConverter" component={TimestampConverter} options={screenOpts('Timestamp Converter', 'TimestampConverter')} />
            <Stack.Screen name="UrlEncoder" component={UrlEncoder} options={screenOpts('URL Encoder / Parser', 'UrlEncoder')} />
        </Stack.Navigator>
    );
};
