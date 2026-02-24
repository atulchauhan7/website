# Luxe Theme — Shopify Theme

A premium, minimal Shopify theme with smooth animations, custom cursor, parallax effects, and a refined editorial aesthetic.

## Features

- Scroll-triggered animations with multiple animation types
- Custom cursor follower (desktop only)
- Parallax media sections
- Hero slideshow with particles
- Product gallery with zoom
- Magnetic buttons and tilt effects
- Cart drawer with AJAX add-to-cart
- Newsletter popup
- Fully responsive design
- Customizable via Shopify Theme Editor (colors, fonts, layout, effects)

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) v20.10.0 or later
- A Shopify store (free [development store](https://partners.shopify.com/) works)
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli)

### Setup

1. **Install Shopify CLI**

   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

2. **Navigate to the theme directory**

   ```bash
   cd luxe-theme
   ```

3. **Start the dev server**

   ```bash
   shopify theme dev --store your-store.myshopify.com
   ```

4. **Authenticate** — A browser window will open. Log in with your Shopify account and enter the device code shown in the terminal.

5. **Preview** — Once authenticated, a local URL (typically `http://127.0.0.1:9292`) will open with a live preview of your theme using real store data.

### Useful Commands

| Command | Description |
|---------|-------------|
| `shopify theme dev` | Start local dev server with hot reload |
| `shopify theme push` | Push theme to your store |
| `shopify theme pull` | Pull latest theme from store |
| `shopify theme check` | Lint theme for errors and best practices |
| `shopify theme package` | Package theme into a zip for upload |

## Upload to Shopify

1. Zip the theme: select all files inside `luxe-theme/` (not the folder itself) and compress.
2. Go to **Shopify Admin → Online Store → Themes → Add theme → Upload zip file**.
3. The uploaded theme will be unpublished by default. Click **Publish** when ready.

## Theme Structure

```
assets/          → CSS, JS files
config/          → Theme settings schema and defaults
layout/          → Main theme layout (theme.liquid)
locales/         → Translation strings
sections/        → Modular page sections
snippets/        → Reusable Liquid partials
templates/       → Page templates
```

## Customization

Open the **Theme Editor** in Shopify Admin to configure:

- **Colors** — Accent, text, background, surface, border
- **Typography** — Heading and body fonts (via Shopify font picker)
- **Layout** — Container width, section spacing, border radius
- **Animations** — Toggle scroll animations, custom cursor, newsletter popup
- **Social Media** — Instagram, Facebook, Twitter/X, Pinterest, TikTok URLs
- **Favicon** — Upload a 32x32 PNG

## License

Proprietary. All rights reserved.
