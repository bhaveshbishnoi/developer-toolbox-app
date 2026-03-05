import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ScreenWrapperProps {
    children: React.ReactNode;
    scrollable?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, scrollable = true }) => {
    const theme = useTheme();

    const content = (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {children}
        </View>
    );

    if (scrollable) {
        return (
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                style={{ backgroundColor: theme.colors.background }}
            >
                {content}
            </ScrollView>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollContent: {
        flexGrow: 1,
    },
});
