# sacredmonster

Website for Szaja Gottlieb's sculpture, rebuilt as plain HTML and CSS from the old Wix site.

## How it's organized

- `content/site.json` holds all text, captions and the list of works. Edit this file to change the site.
- `css/style.css` is the one stylesheet for every page.
- `images/` contains the full-size images (up to 2400px). `images/thumbs/` has the smaller versions used on the Portfolio page.
- `build.js` turns `site.json` into the HTML pages: `index.html`, `sacred-monster.html`, `story.html`, `portfolio.html` and `works/*.html`.
- `content/CONTENT.md` and `content/reference/` hold the original Wix content and screenshots, kept for reference.

## Making changes

1. Edit `content/site.json` (text, captions, works) or `css/style.css` (look and layout).
2. Run `node build.js` to regenerate the pages. It has no dependencies.
3. Open `index.html` in a browser to check.

Don't edit the generated `.html` files by hand: the next build overwrites them.

### Adding a work

Add an entry to the right series in `site.json`, using the same shape as the others. Then:

1. Add an entry under `images` that points to the new file.
2. Make a thumbnail of it in `images/thumbs/`, for example with `convert images/x.jpg -resize 640x640\> images/thumbs/x.jpg`.
3. Give the work a `wix_detail_page` value (any text) if it should get its own page.

The Portfolio page and the work's own page are both generated from that entry. Each work page's **Back** button goes to the previous work in portfolio order, and the first one goes to the Sacred Monster page, as it did on Wix.

## Hosting

Everything is static, so any static host works, including GitHub Pages serving from the repository root.
