export const THEME = {
    light: {
        primary: '#2d4d2d',    // Dark Green (Sidebar & Buttons)
        secondary: '#ffd700',  // Gold (Highlights & Names)
        bg: '#f4f7f4',         // Light Greenish-Grey (Page Background)
        card: '#ffffff',       // White (Forms & Product Cards)
        text: '#333333',       // Dark Grey
        accent: '#ff4d4d'      // Red (Logout & Delete)
    }
};

export const getStyles = () => {
    const t = THEME.light;
    return {
        // Main Container Cards
        card: {
            background: t.card,
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '20px',
            transition: 'transform 0.2s',
        },
        // Grid Layout for Marketplace and Inventory
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px'
        },
        // Standard Input Styling
        input: {
            width: '100%',
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
        },
        // Primary Action Buttons
        btnPrimary: {
            background: t.primary,
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            width: 'auto'
        },
        // Sidebar Navigation Links
        navItem: (isActive) => ({
            padding: '15px',
            cursor: 'pointer',
            borderRadius: '8px',
            background: isActive ? '#2d4d2d' : 'transparent',
            color: 'white',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        })
    };
};