import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';

export interface ToolDefinition {
    id: keyof RootStackParamList; // Maps to navigation route
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    description: string;
    keywords: string[];
}

export const TOOLS: ToolDefinition[] = [
    {
        id: 'JsonFormatter',
        name: 'JSON Formatter',
        icon: 'code-json',
        description: 'Format, validate and minify JSON data',
        keywords: ['json', 'format', 'minify', 'validate', 'beautify']
    },
    {
        id: 'Base64Encoder',
        name: 'Base64 Encoder',
        icon: 'format-text', // Or just 'format-text'
        description: 'Encode and decode Base64 strings',
        keywords: ['base64', 'encode', 'decode', 'text']
    },
    {
        id: 'JwtDecoder',
        name: 'JWT Decoder',
        icon: 'security',
        description: 'Decode JSON Web Tokens',
        keywords: ['jwt', 'token', 'decode', 'auth', 'security']
    },
    {
        id: 'RegexTester',
        name: 'Regex Tester',
        icon: 'regex',
        description: 'Test regular expressions against text',
        keywords: ['regex', 'regular', 'expression', 'test']
    },
    {
        id: 'ColorConverter',
        name: 'Color Converter',
        icon: 'palette',
        description: 'Convert between HEX, RGB and HSL',
        keywords: ['color', 'hex', 'rgb', 'hsl', 'convert']
    },
    {
        id: 'HashGenerator',
        name: 'Hash Generator',
        icon: 'pound', // or 'fingerprint'
        description: 'Generate MD5, SHA1, SHA256 hashes',
        keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'crypto']
    },
    {
        id: 'ApiTester',
        name: 'API Tester',
        icon: 'api',
        description: 'Send HTTP requests to APIs',
        keywords: ['api', 'http', 'request', 'postman', 'fetch', 'rest']
    },
    {
        id: 'UuidGenerator',
        name: 'UUID Generator',
        icon: 'identifier',
        description: 'Generate version 4 UUIDs',
        keywords: ['uuid', 'guid', 'generate', 'random']
    },
    {
        id: 'TimestampConverter',
        name: 'Timestamp Converter',
        icon: 'clock-outline',
        description: 'Convert Unix timestamp to date',
        keywords: ['time', 'timestamp', 'unix', 'date', 'convert']
    },
    {
        id: 'UrlEncoder',
        name: 'URL Encoder',
        icon: 'link',
        description: 'Encode and decode URLs',
        keywords: ['url', 'encode', 'decode', 'uri', 'link', 'web']
    }
];
