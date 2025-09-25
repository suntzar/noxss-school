/* ==========================================================================
   Noxss Library: Dynamic Theme Generator
   - Gera paletas de cores claras ou escuras a partir de uma cor de destaque.
   - Versão: 2.1
   - Ativado via atributos: data-noxss-theme-gen="dark|light" e data-noxss-palette-gen="#RRGGBB"
   ========================================================================== */

(function () {
    if (!window.Noxss) {
        window.Noxss = {};
    }

    const ThemeGenerator = {
        hexToHsl(hex) {
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) return null;
            let r = parseInt(hex.slice(1, 3), 16) / 255;
            let g = parseInt(hex.slice(3, 5), 16) / 255;
            let b = parseInt(hex.slice(5, 7), 16) / 255;

            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h * 360, s: s * 100, l: l * 100 };
        },
        
        hslToHex(h, s, l) {
            s /= 100;
            l /= 100;
            let c = (1 - Math.abs(2 * l - 1)) * s,
                x = c * (1 - Math.abs((h / 60) % 2 - 1)),
                m = l - c/2,
                r = 0, g = 0, b = 0;
            if (0 <= h && h < 60) { r = c; g = x; b = 0; }
            else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
            else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
            else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
            else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
            else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
            r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
            g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
            b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        },

        generateDarkPalette(accentHsl) {
            const H = accentHsl.h;
            const textOnAccent = accentHsl.l > 55 ? '#111111' : '#FFFFFF';
            const accentColorHex = this.hslToHex(H, accentHsl.s, accentHsl.l);

            return {
                '--noxss-bg-main':              `hsl(${H}, 10%, 10%)`,
                '--noxss-bg-surface':           `hsl(${H}, 12%, 14%)`,
                '--noxss-bg-elements':          `hsl(${H}, 12%, 17%)`,
                '--noxss-border-color':         `hsl(${H}, 10%, 22%)`,
                '--noxss-text-primary':         `hsl(${H}, 25%, 95%)`,
                '--noxss-text-secondary':       `hsl(${H}, 15%, 65%)`,
                '--noxss-accent-primary':       accentColorHex,
                '--noxss-accent-primary-hover': `hsl(${H}, ${accentHsl.s}%, ${Math.min(100, accentHsl.l + 8)}%)`,
                '--noxss-accent-primary-rgb':   `${parseInt(accentColorHex.slice(1, 3), 16)}, ${parseInt(accentColorHex.slice(3, 5), 16)}, ${parseInt(accentColorHex.slice(5, 7), 16)}`,
                '--noxss-text-on-accent':       textOnAccent,
            };
        },

        generateLightPalette(accentHsl) {
            const H = accentHsl.h;
            
            let adjustedL = accentHsl.l;
            if (accentHsl.l > 75) {
                adjustedL = 65;
            }
            
            const accentColorHex = this.hslToHex(H, accentHsl.s, adjustedL);
            const textOnAccent = adjustedL > 55 ? '#111111' : '#FFFFFF';

            return {
                '--noxss-bg-main':              `hsl(${H}, 25%, 97%)`,
                '--noxss-bg-surface':           '#ffffff',
                '--noxss-bg-elements':          `hsl(${H}, 25%, 97%)`,
                '--noxss-border-color':         `hsl(${H}, 20%, 90%)`,
                '--noxss-text-primary':         `hsl(${H}, 10%, 20%)`,
                '--noxss-text-secondary':       `hsl(${H}, 8%, 45%)`,
                '--noxss-accent-primary':       accentColorHex,
                '--noxss-accent-primary-hover': `hsl(${H}, ${accentHsl.s}%, ${Math.max(0, adjustedL - 8)}%)`,
                '--noxss-accent-primary-rgb':   `${parseInt(accentColorHex.slice(1, 3), 16)}, ${parseInt(accentColorHex.slice(3, 5), 16)}, ${parseInt(accentColorHex.slice(5, 7), 16)}`,
                '--noxss-text-on-accent':       textOnAccent,
            };
        },
        
        buildCss(palette) {
             const baseColors = {
                '--noxss-color-success': '#28a745',
                '--noxss-color-danger':  '#dc3545',
                '--noxss-color-warning': '#ffc107',
             };
             const finalPalette = {...palette, ...baseColors};
             return Object.entries(finalPalette).map(([key, value]) => `${key}: ${value};`).join('\n');
        },

        apply(cssVariables) {
            let styleTag = document.getElementById('noxss-dynamic-palette');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'noxss-dynamic-palette';
                document.head.appendChild(styleTag);
            }
            styleTag.textContent = `[data-theme="generated"] {\n${cssVariables}\n}`;
            document.documentElement.setAttribute('data-theme', 'generated');
        },

        init() {
            const processNode = (node) => {
                const themeMode = node.getAttribute('data-noxss-theme-gen') || 'dark';
                const colorValue = node.getAttribute('data-noxss-palette-gen');
                
                if (colorValue) {
                    const accentHsl = this.hexToHsl(colorValue);
                    if (!accentHsl) return;

                    let palette;
                    if (themeMode === 'light') {
                        palette = this.generateLightPalette(accentHsl);
                    } else {
                        palette = this.generateDarkPalette(accentHsl);
                    }
                    
                    const cssVariables = this.buildCss(palette);
                    this.apply(cssVariables);
                }
            };
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && (mutation.attributeName === 'data-noxss-theme-gen' || mutation.attributeName === 'data-noxss-palette-gen')) {
                        processNode(mutation.target);
                    }
                });
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-noxss-theme-gen', 'data-noxss-palette-gen']
            });

            processNode(document.documentElement);
        }
    };

    window.Noxss.ThemeGenerator = ThemeGenerator;
    document.addEventListener('DOMContentLoaded', () => window.Noxss.ThemeGenerator.init());
})();