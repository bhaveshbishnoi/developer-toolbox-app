import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';

export type ToolCategory = 'device' | 'network' | 'crypto' | 'formatter' | 'utility';

export interface ToolDefinition {
    id: keyof RootStackParamList; // Maps to navigation route
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    description: string;
    keywords: string[];
    category: ToolCategory;
    isAndroidNative?: boolean;
    badge?: string;
}

export const CATEGORIES: { id: ToolCategory | 'all'; name: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { id: 'all', name: 'All Tools', icon: 'view-grid-outline' },
    { id: 'device', name: 'Device & Hardware', icon: 'cellphone-cog' },
    { id: 'network', name: 'Network & API', icon: 'access-point-network' },
    { id: 'crypto', name: 'Crypto & Auth', icon: 'shield-key-outline' },
    { id: 'formatter', name: 'Formatters', icon: 'code-braces' },
    { id: 'utility', name: 'Utilities', icon: 'toolbox-outline' },
];

export const TOOLS: ToolDefinition[] = [
    // --- 6 NEW ANDROID MODULES ---
    {
        id: 'DeviceInfo',
        name: 'Device Information',
        icon: 'cellphone-information',
        description: 'Device specs, CPU, RAM, storage, display & battery details',
        keywords: ['device', 'hardware', 'info', 'cpu', 'ram', 'memory', 'storage', 'battery', 'display', 'android', 'model'],
        category: 'device',
        isAndroidNative: true,
        badge: 'Module 1',
    },
    {
        id: 'SensorTester',
        name: 'Sensor Tester',
        icon: 'axis-arrow',
        description: 'Live sensor readings for accelerometer, gyro, compass & more',
        keywords: ['sensor', 'accelerometer', 'gyroscope', 'magnetometer', 'compass', 'light', 'barometer', 'proximity'],
        category: 'device',
        isAndroidNative: true,
        badge: 'Module 2',
    },
    {
        id: 'NetworkAnalyzer',
        name: 'Network Analyzer',
        icon: 'wifi-check',
        description: 'Public/local IP, DNS lookup, ping latency, Wi-Fi & HTTP tester',
        keywords: ['network', 'ip', 'wifi', 'dns', 'ping', 'latency', 'local ip', 'public ip', 'connectivity'],
        category: 'network',
        isAndroidNative: true,
        badge: 'Module 3',
    },
    {
        id: 'QrToolkit',
        name: 'QR Code Toolkit',
        icon: 'qrcode-scan',
        description: 'Generate & scan QR codes for text, URLs, Wi-Fi & vCard contacts',
        keywords: ['qr', 'qrcode', 'barcode', 'scan', 'generate', 'wifi qr', 'contact qr', 'vcard'],
        category: 'utility',
        isAndroidNative: true,
        badge: 'Module 4',
    },
    {
        id: 'HardwareTester',
        name: 'Hardware Tester',
        icon: 'vibrate',
        description: 'Test touchscreen, multi-touch, vibration, torch, speaker & mic',
        keywords: ['hardware', 'test', 'touch', 'multi-touch', 'vibrate', 'flashlight', 'torch', 'speaker', 'mic', 'screen colors'],
        category: 'device',
        isAndroidNative: true,
        badge: 'Module 5',
    },
    {
        id: 'AppInspector',
        name: 'App Inspector',
        icon: 'apps',
        description: 'Inspect installed apps, package info, target SDK & permissions',
        keywords: ['app', 'inspector', 'package', 'apk', 'installed', 'permissions', 'sdk', 'target sdk'],
        category: 'device',
        isAndroidNative: true,
        badge: 'Module 6',
    },

    // --- 10 EXISTING TOOLS ---
    {
        id: 'JsonFormatter',
        name: 'JSON Formatter',
        icon: 'code-json',
        description: 'Format, validate, minify and sort JSON data with stats',
        keywords: ['json', 'format', 'minify', 'validate', 'beautify', 'indent'],
        category: 'formatter',
    },
    {
        id: 'Base64Encoder',
        name: 'Base64 Encoder',
        icon: 'swap-horizontal-bold',
        description: 'Encode & decode standard and URL-safe Base64 strings',
        keywords: ['base64', 'encode', 'decode', 'text', 'binary', 'urlsafe'],
        category: 'crypto',
    },
    {
        id: 'JwtDecoder',
        name: 'JWT Decoder',
        icon: 'security',
        description: 'Decode header, payload & expiration of JSON Web Tokens',
        keywords: ['jwt', 'token', 'decode', 'auth', 'security', 'bearer', 'claims'],
        category: 'crypto',
    },
    {
        id: 'RegexTester',
        name: 'Regex Tester',
        icon: 'regex',
        description: 'Test regular expressions with groups, replacement & presets',
        keywords: ['regex', 'regular', 'expression', 'test', 'match', 'replace'],
        category: 'formatter',
    },
    {
        id: 'ColorConverter',
        name: 'Color Converter',
        icon: 'palette-outline',
        description: 'Convert HEX, RGB, HSL, RGBA with preview & contrast checks',
        keywords: ['color', 'hex', 'rgb', 'hsl', 'rgba', 'convert', 'palette'],
        category: 'formatter',
    },
    {
        id: 'HashGenerator',
        name: 'Hash Generator',
        icon: 'fingerprint',
        description: 'Generate MD5, SHA-1, SHA-256, SHA-512 & HMAC hashes',
        keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'crypto', 'hmac'],
        category: 'crypto',
    },
    {
        id: 'ApiTester',
        name: 'API Tester',
        icon: 'api',
        description: 'Test HTTP endpoints with custom methods, headers & body',
        keywords: ['api', 'http', 'request', 'postman', 'fetch', 'rest', 'endpoint'],
        category: 'network',
    },
    {
        id: 'UuidGenerator',
        name: 'UUID Generator',
        icon: 'identifier',
        description: 'Generate UUID v4 & v1 with custom casing and batch counts',
        keywords: ['uuid', 'guid', 'generate', 'random', 'v4', 'v1'],
        category: 'utility',
    },
    {
        id: 'TimestampConverter',
        name: 'Timestamp Converter',
        icon: 'clock-outline',
        description: 'Convert Unix timestamps to dates & ISO strings with live clock',
        keywords: ['time', 'timestamp', 'unix', 'date', 'convert', 'iso', 'epoch'],
        category: 'utility',
    },
    {
        id: 'UrlEncoder',
        name: 'URL Encoder / Parser',
        icon: 'link-variant',
        description: 'Encode, decode and parse URLs into params and components',
        keywords: ['url', 'encode', 'decode', 'uri', 'link', 'web', 'query', 'params'],
        category: 'network',
    },
];
