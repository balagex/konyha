import Lara from '@primeng/themes/lara';
import { definePreset } from "@primeng/themes";

// 18-as primeng-nél alapjaiban átalakították a stílus kezelést,sass helyett css változókat használnak, amiket bizonyos
// Tokenek segítségével lehet felüldefiniálni. Lásd: https://primeng.org/theming
// A nagyeszűek pl. az elsődleges színt (pl. primary gomb színe, stb.) lecserélték valami zöldre, és az alábbi configgal lehet
// más színre módosítani:

export const ThemePreset = definePreset(Lara, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        }
    },
    // Példa a button komponens gap paraméterének globális felülírására:
    // components: {
    //     button: {
    //         gap: '2rem'
    //     }
    // }
});