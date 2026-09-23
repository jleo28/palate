Brand assets, exported from the 8te asset sheet.

- `logo.png` (512px) is what `Wordmark` (src/components/Wordmark.tsx) renders. Replace this file to change the mark everywhere; the component falls back to the text "8teSC" in the display face if it is ever missing.
- `apple-touch-icon.png` (180px) and `favicon.png` (48px) are the home-screen and tab icons.

The app palette in `src/styles/tokens.css` is derived from this logo's five colours, so replacing the artwork with a different palette means re-deriving those tokens and re-running `pnpm check:contrast`.

Only a light version of the mark was exported. On dark backgrounds it renders as a light tile, which reads as an app icon but is not ideal; a dark variant would be worth adding.
