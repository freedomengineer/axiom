import withMT from '@material-tailwind/react/utils/withMT'
import type { Config } from 'tailwindcss'

const config = withMT({
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        'node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}',
        'node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    plugins: [require('tailwindcss/nesting'), require('postcss-nesting')],
    theme: {
        writingMode: {
            'vertical-rl': 'vertical-rl',
            'vertical-lr': 'vertical-lr',
        },
        extend: {
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
                condensed: ['Roboto Condensed', 'sans-serif'],
                slab: ['Roboto Slab', 'serif'],
                display: ['Poppins', 'sans-serif'],
                mono: ['Roboto Mono', 'monospace'],
            },
            screens: {
                md: '1024px',
            },
            colors: {
                hot: {
                    50: '#F7F2EE',
                    100: '#F0E7E0',
                    200: '#E2D0C0',
                    300: '#D3B8A1',
                    400: '#C4A182',
                    500: '#B68963',
                    600: '#A0724B',
                    700: '#815C3C',
                    800: '#5E432C',
                    900: '#402E1E',
                    950: '#1F160F',
                },
                cold: {
                    50: '#F2F6F7',
                    100: '#E3EAED',
                    200: '#C9D8DE',
                    300: '#ADC3CC',
                    400: '#91AEBB',
                    500: '#7499A9',
                    600: '#5E8697',
                    700: '#4C6D7B',
                    800: '#3A545F',
                    900: '#2A3C44',
                    950: '#151F23',
                },
                primary: {
                    50: '#FDF1ED',
                    100: '#FBDFD5',
                    200: '#F7C2B1',
                    300: '#F2A287',
                    400: '#EE8562',
                    500: '#EA6539',
                    600: '#DD4917',
                    700: '#B93D13',
                    800: '#8F2F0F',
                    900: '#68220B',
                    950: '#331105',
                },
            },
            backgroundImage: {
                hypothesis: "url('/background/hypothesis.png')",
            },
        },
    },
} as Config)

export default config
