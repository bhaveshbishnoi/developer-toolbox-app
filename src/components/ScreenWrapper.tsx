import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ScreenWrapperProps {
    children: React.ReactNode;
    scrollable?: boolean;
    contentContainerStyle?: any;
    header?: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    scrollable = true,
    contentContainerStyle,
    header,
}) => {
    const theme = useTheme();

    return (
        <KeyboardAvoidingView
            style={[styles.root, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {header}
            {scrollable ? (
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={{ backgroundColor: theme.colors.background }}
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.staticContent, contentContainerStyle]}>
                    {children}
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    staticContent: {
        flex: 1,
        padding: 16,
    },
});
