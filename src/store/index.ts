import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOOLS } from '../utils/tools';

export interface ToolHistoryItem {
    id: string;
    toolId: string;
    toolName: string;
    input: string;
    output: string;
    timestamp: number;
}

export interface AppPreferences {
    jsonIndent: number;
    showCopyToast: boolean;
    vibrationEnabled: boolean;
}

export interface AppState {
    favorites: string[]; // List of tool IDs
    history: ToolHistoryItem[];
    recentTools: string[]; // List of tool IDs recently used
    preferences: AppPreferences;
    toggleFavorite: (toolId: string) => void;
    addHistory: (item: Omit<ToolHistoryItem, 'id' | 'toolName'>) => void;
    deleteHistoryItem: (id: string) => void;
    clearHistory: () => void;
    addRecentTool: (toolId: string) => void;
    updatePreferences: (prefs: Partial<AppPreferences>) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            favorites: ['DeviceInfo', 'JsonFormatter', 'NetworkAnalyzer', 'QrToolkit'],
            history: [],
            recentTools: ['DeviceInfo', 'JsonFormatter'],
            preferences: {
                jsonIndent: 2,
                showCopyToast: true,
                vibrationEnabled: true,
            },
            toggleFavorite: (toolId) =>
                set((state) => ({
                    favorites: state.favorites.includes(toolId)
                        ? state.favorites.filter((id) => id !== toolId)
                        : [...state.favorites, toolId],
                })),
            addHistory: (item) =>
                set((state) => {
                    const tool = TOOLS.find((t) => t.id === item.toolId);
                    const newItem: ToolHistoryItem = {
                        ...item,
                        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                        toolName: tool?.name || item.toolId,
                    };
                    return {
                        history: [newItem, ...state.history.filter((h) => !(h.toolId === item.toolId && h.input === item.input))].slice(0, 100),
                    };
                }),
            deleteHistoryItem: (id) =>
                set((state) => ({
                    history: state.history.filter((item) => item.id !== id),
                })),
            clearHistory: () => set({ history: [] }),
            addRecentTool: (toolId) =>
                set((state) => {
                    const newRecent = [toolId, ...state.recentTools.filter((id) => id !== toolId)];
                    return { recentTools: newRecent.slice(0, 8) };
                }),
            updatePreferences: (prefs) =>
                set((state) => ({
                    preferences: { ...state.preferences, ...prefs },
                })),
        }),
        {
            name: 'developer-toolbox-storage-v2',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
