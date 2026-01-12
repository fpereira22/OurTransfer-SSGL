import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                ssgl: {
                    DEFAULT: '#0A9345', // Tu verde principal
                    dark: '#076831',    // Verde oscuro para hover
                    light: '#E6F4EA',   // Verde muy claro para fondos
                },
            },
        },
    },
    plugins: [],
};
export default config;