import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { MainTabParamList, RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { useAppStore } from '../store';

// Temporary Settings Screen
import { View, Text } from 'react-native';
const SettingsScreen = () => <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff' }}>Settings</Text></View>;

// Tools
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
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="home-outline" color={color} size={size} />,
                    title: 'Dashboard'
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="heart-outline" color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="history" color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="cog-outline" color={color} size={size} />,
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
            icon={isFav ? "heart" : "heart-outline"}
            iconColor={isFav ? theme.colors.error : theme.colors.onSurface}
            size={24}
            onPress={() => toggleFavorite(toolId)}
        />
    );
};

export const RootNavigator = () => {
    const theme = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.onSurface,
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="JsonFormatter" component={JsonFormatter} options={{ title: 'JSON Formatter', headerRight: () => <HeaderRight toolId="JsonFormatter" /> }} />
            <Stack.Screen name="Base64Encoder" component={Base64Encoder} options={{ title: 'Base64 Encoder', headerRight: () => <HeaderRight toolId="Base64Encoder" /> }} />
            <Stack.Screen name="JwtDecoder" component={JwtDecoder} options={{ title: 'JWT Decoder', headerRight: () => <HeaderRight toolId="JwtDecoder" /> }} />
            <Stack.Screen name="RegexTester" component={RegexTester} options={{ title: 'Regex Tester', headerRight: () => <HeaderRight toolId="RegexTester" /> }} />
            <Stack.Screen name="ColorConverter" component={ColorConverter} options={{ title: 'Color Converter', headerRight: () => <HeaderRight toolId="ColorConverter" /> }} />
            <Stack.Screen name="HashGenerator" component={HashGenerator} options={{ title: 'Hash Generator', headerRight: () => <HeaderRight toolId="HashGenerator" /> }} />
            <Stack.Screen name="ApiTester" component={ApiTester} options={{ title: 'API Tester', headerRight: () => <HeaderRight toolId="ApiTester" /> }} />
            <Stack.Screen name="UuidGenerator" component={UuidGenerator} options={{ title: 'UUID Generator', headerRight: () => <HeaderRight toolId="UuidGenerator" /> }} />
            <Stack.Screen name="TimestampConverter" component={TimestampConverter} options={{ title: 'Timestamp Converter', headerRight: () => <HeaderRight toolId="TimestampConverter" /> }} />
            <Stack.Screen name="UrlEncoder" component={UrlEncoder} options={{ title: 'URL Encoder', headerRight: () => <HeaderRight toolId="UrlEncoder" /> }} />
        </Stack.Navigator>
    );
};
