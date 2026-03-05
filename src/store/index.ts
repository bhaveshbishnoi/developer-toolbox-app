import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ToolHistoryItem {
    id: string;
    toolId: string;
    input: string;
    output: string;
    timestamp: number;
}

export interface AppState {
    favorites: string[]; // List of tool IDs
    history: ToolHistoryItem[];
    recentTools: string[]; // List of tool IDs recently used
    toggleFavorite: (toolId: string) => void;
    addHistory: (item: Omit<ToolHistoryItem, 'id'>) => void;
    deleteHistoryItem: (id: string) => void;
    clearHistory: () => void;
    addRecentTool: (toolId: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            favorites: [],
            history: [],
            recentTools: [],
            toggleFavorite: (toolId) =>
                set((state) => ({
                    favorites: state.favorites.includes(toolId)
                        ? state.favorites.filter((id) => id !== toolId)
                        : [...state.favorites, toolId],
                })),
            addHistory: (item) =>
                set((state) => ({
                    history: [
                        { ...item, id: Math.random().toString(36).substring(7) },
                        ...state.history,
                    ].slice(0, 100), // Keep last 100
                })),
            deleteHistoryItem: (id) =>
                set((state) => ({
                    history: state.history.filter((item) => item.id !== id),
                })),
            clearHistory: () => set({ history: [] }),
            addRecentTool: (toolId) =>
                set((state) => {
                    const newRecent = [toolId, ...state.recentTools.filter((id) => id !== toolId)];
                    return { recentTools: newRecent.slice(0, 5) }; // Keep last 5
                }),
        }),
        {
            name: 'developer-toolbox-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
