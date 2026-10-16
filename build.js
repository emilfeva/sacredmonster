#!/usr/bin/env node
// Builds the static site from content/site.json. No dependencies: run `node build.js`.
// Edit text, captions and works in content/site.json, then rebuild.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
// Changes whenever the stylesheet does, so browsers fetch the new one instead of a cached copy.
const CSS_VERSION = require('crypto').createHash('md5')
  .update(fs.readFileSync(path.join(ROOT, 'css/style.css'))).digest('hex').slice(0, 8);
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const page = id => site.pages.find(p => p.id === id);

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Like esc, but *text* becomes italic (titles, foreign words).
const rich = s => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
// Text with the *italic* marks removed, for page titles and image descriptions.
const plain = s => String(s).replace(/\*/g, '');

// Top-level pages and their output files.
const FILES = { home: 'index.html', 'sacred-monster': 'sacred-monster.html', story: 'story.html', portfolio: 'portfolio.html' };

// Every captioned, linked work gets its own page, named after its image.
// Clicking the image on that page returns to the work on the Portfolio page.
const works = page('portfolio').series.flatMap(s => s.works).filter(w => w.wix_detail_page);
works.forEach(w => { w.file = `works/${w.image}.html`; });

// `prefix` is the relative path back to the site root ('' or '../').
function img(name, { prefix = '', thumb = false, alt = '', cls = '', eager = false } = {}) {
  const im = site.images[name];
  const src = prefix + (thumb ? im.file.replace('images/', 'images/thumbs/') : im.file);
  const scale = thumb ? Math.min(1, 640 / Math.max(im.width, im.height)) : 1;
  return `<img src="${src}" width="${Math.round(im.width * scale)}" height="${Math.round(im.height * scale)}"` +
    ` alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''}${eager ? '' : ' loading="lazy"'}>`;
}

function link(l, prefix = '', cls = 'button') {
  return `<a class="${cls}" href="${prefix}${FILES[l.to]}">${esc(l.text)}</a>`;
}

const SITE_URL = 'https://szajagottlieb.com/';
const EMAIL = 'szajagottlieb@szajagottlieb.com';
const DESCRIPTION = 'Sculptor. Sacred Monster (Monstre Sacré) and a portfolio of work, 1978–2026.';

// `file` is the page's path from the site root, for its link preview (og:url).
function layout({ title, body, file, prefix = '', bodyClass = '', footer = false }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(DESCRIPTION)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Szaja Gottlieb">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(DESCRIPTION)}">
<meta property="og:url" content="${SITE_URL}${file === FILES.home ? '' : file}">
<meta property="og:image" content="${SITE_URL}images/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Abraxas, by Szaja Gottlieb">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap">
<link rel="stylesheet" href="${prefix}css/style.css?v=${CSS_VERSION}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${body}
${footer ? `<footer class="site-footer">Inquiries: <a href="mailto:${EMAIL}">${EMAIL}</a></footer>` : ''}
</body>
</html>
`;
}

const TITLE = 'Szaja Gottlieb';

function home() {
  const p = page('home');
  return layout({
    title: TITLE, file: FILES.home, bodyClass: 'home',
    body: `<main class="landing">
  <h1>${esc(p.heading)}</h1>
  <figure>
    ${img(p.image, { alt: p.caption[0], eager: true })}
    <figcaption>${p.caption.map(esc).join('<br>')}</figcaption>
  </figure>
  ${p.links.map(l => link(l, '', 'button enter')).join('\n')}
</main>`,
  });
}

function sacredMonster() {
  const p = page('sacred-monster');
  const side = names => names.map(n => `<figure>${img(n, { alt: 'Sacred Monster, detail' })}</figure>`).join('\n      ');
  return layout({
    title: `Sacred Monster | ${TITLE}`, file: FILES['sacred-monster'], footer: true,
    body: `<main class="sacred-monster">
  <header class="page-header">
    <h1>${esc(p.heading).replace(/ (\d{4}–\d{4})/, '<br>$1')}</h1>
    <div class="quote-block">
      <p class="quote">${esc(p.subheading)}</p>
      ${p.attribution ? `<p class="attribution">${img(p.attribution, { alt: 'S.G.', eager: true })}</p>` : ''}
    </div>
  </header>
  <div class="sm-grid">
    <div class="sm-side sm-left">
      ${side(p.secondary_images.left)}
    </div>
    <figure class="sm-main">
      ${img(p.main_image, { alt: 'Sacred Monster', eager: true })}
    </figure>
    <div class="sm-side sm-right">
      ${side(p.secondary_images.right)}
    </div>
    <ul class="facts">
      ${p.facts.map(f => `<li>${esc(f)}</li>`).join('\n      ')}
    </ul>
  </div>
  ${p.closing ? `<p class="closing">${p.closing.map(t => `<span>${rich(t)}</span>`).join(' ')}</p>` : ''}
  <nav class="page-nav">${p.links.map(l => link(l)).join(' ')}</nav>
</main>`,
  });
}

function story() {
  const p = page('story');
  return layout({
    title: `The Story | ${TITLE}`, file: FILES.story,
    body: `<main class="story">
  <div class="photo-grid">
    ${p.photos.map(ph => `<figure>${img(ph.image, { alt: `Sacred Monster, ${ph.caption}` })}<figcaption>${esc(ph.caption)}</figcaption></figure>`).join('\n    ')}
  </div>
  <article class="story-text">
    <h1>${esc(p.heading)}</h1>
    ${p.epigraph ? `<p class="epigraph">${rich(p.epigraph)}</p>` : ''}
    ${p.paragraphs.map(t => `<p>${rich(t)}</p>`).join('\n    ')}
    <p class="dedication">${rich(p.dedication)}</p>
  </article>
  <nav class="page-nav">${p.links.map(l => link(l)).join(' ')}</nav>
</main>`,
  });
}

// "Material | dimensions" in site.json is shown as two lines: material, then dimensions.
const detailLines = d => d.split(' | ').map(esc);

function workCard(w) {
  const caption = w.title ? `<figcaption>
          <span class="work-title">${rich(w.title)}</span>
          ${detailLines(w.details).map(t => `<span>${t}</span>`).join('\n          ')}${w.collection ? `\n          <span>(${esc(w.collection)})</span>` : ''}
        </figcaption>` : '';
  const picture = img(w.image, { thumb: true, alt: w.title ? plain(w.title) : 'Untitled work' });
  return `<figure class="work" id="${w.image}">
        ${w.file ? `<a href="${w.file}">${picture}</a>` : picture}
        ${caption}
      </figure>`;
}

function portfolio() {
  const p = page('portfolio');
  return layout({
    title: `Portfolio | ${TITLE}`, file: FILES.portfolio,
    body: `<main class="portfolio">
  <h1>${esc(p.heading)}</h1>
  ${p.series.map(s => `<section class="series">
    <h2>${esc(s.title)}</h2>
    <p class="years">${esc(s.years)}</p>
    <p class="series-description">${esc(s.description)}</p>
    <div class="works-grid">
      ${s.works.map(workCard).join('\n      ')}
    </div>
  </section>`).join('\n  ')}
  ${p.press ? `<section class="series press">
    <h2>${esc(p.press.heading)}</h2>
    ${p.press.items.map(it => `<p>${rich(it.source)}<br>${rich(it.title)}</p>`).join('\n    ')}
  </section>` : ''}
  <nav class="page-nav">${p.links.map(l => link(l)).join(' ')}</nav>
</main>`,
  });
}

function workPage(w) {
  const prefix = '../';
  const images = [w.image, ...(w.detail_images || [])];
  return layout({
    title: `${plain(w.title)} | ${TITLE}`, file: w.file, prefix,
    body: `<main class="work-page">
  <h1>${rich(w.title)}</h1>
  <div class="work-images">
    ${images.map((n, i) => `<a href="${prefix}${FILES.portfolio}#${w.image}">${img(n, { prefix, alt: plain(w.title), eager: i === 0 })}</a>`).join('\n    ')}
  </div>
  <p class="work-details">${detailLines(w.details).join('<br>')}${w.collection ? `<br>(${esc(w.collection)})` : ''}</p>
</main>`,
  });
}

const out = {
  [FILES.home]: home(),
  [FILES['sacred-monster']]: sacredMonster(),
  [FILES.story]: story(),
  [FILES.portfolio]: portfolio(),
};
for (const w of works) out[w.file] = workPage(w);

fs.rmSync(path.join(ROOT, 'works'), { recursive: true, force: true });
fs.mkdirSync(path.join(ROOT, 'works'));
for (const [file, html] of Object.entries(out)) fs.writeFileSync(path.join(ROOT, file), html);
console.log(`Built ${Object.keys(out).length} pages.`);
