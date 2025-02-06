import { createTheme } from "react-data-table-component";

createTheme(
    'dark',
    {
        text: {
            primary: '#f0f0f0', // --sidebar-foreground
            secondary: '#c0c0c0', // --sidebar-accent-foreground
        },
        background: {
            default: 'transparent', // --custom-background
        },
        context: {
            background: '#3a3a3a', // --sidebar-accent
            text: '#f0f0f0', // --sidebar-accent-foreground
        },
        divider: {
            default: '#2a2a2a', // --sidebar-border
        },
        button: {
            default: '#707070', // --sidebar-accent
            hover: 'rgba(255,255,255,.10)',
            focus: 'rgba(255,255,255,.14)',
            disabled: 'rgba(255, 255, 255, .20)',
        },
        sortFocus: {
            default: '#3a3a3a', // --sidebar-accent
        },
    },
    'dark',
);

createTheme(
    'default',
    {
        text: {
            primary: '#3f3f3f', // --sidebar-foreground
            secondary: '#1a1a1a', // --sidebar-primary
        },
        background: {
            default: 'transparent', // --custom-background
        },
        context: {
            background: '#e0e0e0', // --sidebar-accent
            text: '#1a1a1a', // --sidebar-primary
        },
        divider: {
            default: '#d0d0d0', // --sidebar-border
        },
        button: {
            default: '#afafaf', // --sidebar-accent
            hover: 'rgba(0,0,0,.08)',
            focus: 'rgba(0,0,0,.12)',
            disabled: 'rgba(0, 0, 0, .10)',
        },
        sortFocus: {
            default: '#e0e0e0', // --sidebar-accent
        },
    },
    'default',
);

export const themes = {
    dark: 'dark',
    default: 'default'
};