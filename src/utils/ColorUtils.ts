/**
 * Utility class for color scheme operations
 */
export class ColorUtils {
  /**
   * Converts a hex color to HSL format
   * @param hex - Hex color string (e.g., "#FF5733" or "FF5733")
   * @returns HSL object with h (0-360), s (0-100), l (0-100) or null if invalid
   */
  static hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const clean = hex.replace('#', '');
    if (!(clean.length === 3 || clean.length === 6)) return null;
    const full = clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;
    const r = Number.parseInt(full.substring(0, 2), 16) / 255;
    const g = Number.parseInt(full.substring(2, 4), 16) / 255;
    const b = Number.parseInt(full.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  /**
   * Picks a background color scheme class based on the hue value from an image
   * @param h - Hue value (0-360) or undefined/null/NaN for random selection
   * @param styles - CSS module styles object containing color classes
   * @returns CSS class name for the matching background color scheme
   */
  static pickBackgroundSchemeClassByHue(
    h: number | undefined | null,
    styles: Record<string, string>
  ): string {
    if (h === undefined || h === null || Number.isNaN(h)) {
      const classes = [
        styles['background-color-olive'],
        styles['background-color-navy'],
        styles['background-color-sage'],
        styles['background-color-terracotta'],
        styles['background-color-gold'],
        styles['background-color-ivory'],
        styles['background-color-lime'],
        styles['background-color-sea'],
        styles['background-color-mint'],
        styles['background-color-teal'],
        styles['background-color-lavender'],
        styles['background-color-rose'],
        styles['background-color-fuchsia'],
        styles['background-color-brown'],
        styles['background-color-charcoal'],
      ];
      return classes[Math.floor(Math.random() * classes.length)];
    }

    const palette: Array<{ h: number; cls: string }> = [
      { h: 15, cls: styles['background-color-terracotta'] },
      { h: 25, cls: styles['background-color-brown'] },
      { h: 40, cls: styles['background-color-gold'] },
      { h: 50, cls: styles['background-color-ivory'] },
      { h: 100, cls: styles['background-color-lime'] },
      { h: 75, cls: styles['background-color-olive'] },
      { h: 140, cls: styles['background-color-sage'] },
      { h: 150, cls: styles['background-color-mint'] },
      { h: 200, cls: styles['background-color-sea'] },
      { h: 180, cls: styles['background-color-teal'] },
      { h: 220, cls: styles['background-color-navy'] },
      { h: 260, cls: styles['background-color-lavender'] },
      { h: 300, cls: styles['background-color-fuchsia'] },
      { h: 330, cls: styles['background-color-rose'] },
      { h: 210, cls: styles['background-color-charcoal'] },
    ];

    let best = palette[0];
    let bestDist = 360;
    for (const p of palette) {
      const dist = Math.min(Math.abs(h - p.h), 360 - Math.abs(h - p.h));
      if (dist < bestDist) {
        best = p;
        bestDist = dist;
      }
    }
    return best.cls;
  }

  /**
   * Picks a text color scheme class based on the hue value from an image
   * @param h - Hue value (0-360) or undefined/null/NaN for random selection
   * @param styles - CSS module styles object containing color classes
   * @returns CSS class name for the matching text color scheme
   */
  static pickTextSchemeClassByHue(
    h: number | undefined | null,
    styles: Record<string, string>
  ): string {
    if (h === undefined || h === null || Number.isNaN(h)) {
      const classes = [
        styles['text-color-olive'],
        styles['text-color-navy'],
        styles['text-color-sage'],
        styles['text-color-terracotta'],
        styles['text-color-gold'],
        styles['text-color-ivory'],
        styles['text-color-lime'],
        styles['text-color-sea'],
        styles['text-color-mint'],
        styles['text-color-teal'],
        styles['text-color-lavender'],
        styles['text-color-rose'],
        styles['text-color-fuchsia'],
        styles['text-color-brown'],
        styles['text-color-charcoal'],
      ];
      return classes[Math.floor(Math.random() * classes.length)];
    }

    const palette: Array<{ h: number; cls: string }> = [
      { h: 15, cls: styles['text-color-terracotta'] },
      { h: 25, cls: styles['text-color-brown'] },
      { h: 40, cls: styles['text-color-gold'] },
      { h: 50, cls: styles['text-color-ivory'] },
      { h: 100, cls: styles['text-color-lime'] },
      { h: 75, cls: styles['text-color-olive'] },
      { h: 140, cls: styles['text-color-sage'] },
      { h: 150, cls: styles['text-color-mint'] },
      { h: 200, cls: styles['text-color-sea'] },
      { h: 180, cls: styles['text-color-teal'] },
      { h: 220, cls: styles['text-color-navy'] },
      { h: 260, cls: styles['text-color-lavender'] },
      { h: 300, cls: styles['text-color-fuchsia'] },
      { h: 330, cls: styles['text-color-rose'] },
      { h: 210, cls: styles['text-color-charcoal'] },
    ];

    let best = palette[0];
    let bestDist = 360;
    for (const p of palette) {
      const dist = Math.min(Math.abs(h - p.h), 360 - Math.abs(h - p.h));
      if (dist < bestDist) {
        best = p;
        bestDist = dist;
      }
    }
    return best.cls;
  }
}

