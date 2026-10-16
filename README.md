# sacredmonster

Website for Szaja Gottlieb's sculpture, rebuilt as plain HTML and CSS from the old Wix site.

## How it's organized

- `content/site.json` holds all text, captions and the list of works. Edit this file to change the site.
- `css/style.css` is the one stylesheet for every page.
- `images/` contains the full-size images (up to 2400px). `images/thumbs/` has the smaller versions used on the Portfolio page.
- `build.js` turns `site.json` into the HTML pages: `index.html`, `sacred-monster.html`, `story.html`, `portfolio.html`, `works/*.html` and `story/*.html` (one page per photo on the story page).
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

The Portfolio page and the work's own page are both generated from that entry. Clicking the image on a work's page returns to that work on the Portfolio page.

## Hosting

The site is published with GitHub Pages at https://szajagottlieb.com. `.github/workflows/pages.yml` rebuilds and publishes it on every push to `main`, usually within a minute or two. It deploys only the website files: the pages, `works/`, `story/`, `css/`, `images/` and `CNAME`.

How it's set up:

- The repository is public, which GitHub Pages requires on a free account.
- In the repository settings, under **Pages**, the source is **GitHub Actions** and the custom domain is `szajagottlieb.com`. Turn on **Enforce HTTPS** there once GitHub has issued the certificate.
- The domain is registered at GoDaddy in Szaja Gottlieb's account (Emil has delegate access) and auto-renews each October. GoDaddy's Websites + Marketing builder can't host this site, so GoDaddy only provides the domain and its DNS.
- GoDaddy DNS for szajagottlieb.com has four `A` records for `@` (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and a `CNAME` for `www` pointing to `@`. To edit them, open `dcc.godaddy.com/control/dnsmanagement?domainName=szajagottlieb.com` while logged in to that account.
