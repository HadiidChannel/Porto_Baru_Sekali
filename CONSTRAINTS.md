# Engineering Constraints & Quality Bar

Last reviewed: 2026-10-09

## Quality Floor (Always Enforced)
- **Zero Syntax Errors**: All JavaScript files must pass `node --check` clean.
- **Preserve Core Systems**:
  - Existing projects in `data/portfolio.json` must remain intact.
  - Certificates and Mozilla PDF.js canvas viewer (anti-white-screen, anti-auto-download) must remain 100% operational.
  - Contact form integration (Formspree AJAX endpoint `https://formspree.io/f/xppwwaqw`, local server `/api/contact`, and email fallback) must never be broken or removed.
- **Language Contract**: 100% English for all UI copy, navigation, labels, and feedback notifications.
- **No Suppression Hacks**: No `@ts-ignore`, no silenced errors, no empty catch blocks.

## Performance Budgets (Optimized for Low-Budget Smartphones)
| Metric | Threshold | Enforced By |
|---|---|---|
| First Input Delay (FID) / INP | ≤ 100ms | Lightweight vanilla JS, zero heavy runtime frameworks |
| Cumulative Layout Shift (CLS) | ≤ 0.05 | Explicit image aspect ratios and skeleton loaders |
| Frame Rate on Low-End Mobile | 60 FPS | GPU-accelerated transforms (`transform`, `opacity`), no heavy filter chains |
| Ambient Canvas Overhead | < 3% CPU | Throttled particle count (max 12 on mobile), pauses on tab hidden |
| Mobile Touch Targets | ≥ 44 x 44px | Fluid CSS buttons and links |
| Bundle Overhead | Zero external CSS/JS frameworks | Vanilla CSS + Vanilla ES6 |

## Accessibility (WCAG 2.1 AA)
- Contrast ratio ≥ 4.5:1 for standard text, ≥ 3.0:1 for large text and accent badges.
- All interactive elements must have semantic tags, explicit `aria-label` or visible text, and visible focus indicators.
- Responsive across all viewports: 320px, 375px, 768px, 1024px, 1440px without horizontal scroll overflow.
