import { mkdir, writeFile } from 'node:fs/promises';

const sources = [
  {
    label: 'Government of Canada · Science and innovation',
    category: 'Technology',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Science+and+innovation&format=atom&orderBy=desc&pick=100&sort=publishedDate&topic=scienceandinnovation',
  },
  {
    label: 'Statistics Canada',
    category: 'Canadian news',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Statistics+Canada&dept=statisticscanada&format=atom&orderBy=desc&pick=100&sort=publishedDate',
  },
  {
    label: 'Government of Canada · Business and industry',
    category: 'Business & finance',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Business+and+industry&format=atom&orderBy=desc&pick=100&sort=publishedDate&topic=businessandindustry',
  },
  {
    label: 'Government of Canada · Money and finances',
    category: 'Business & finance',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Money+and+finances&format=atom&orderBy=desc&pick=100&sort=publishedDate&topic=moneyandfinances',
  },
  {
    label: 'Department of Finance Canada',
    category: 'Business & finance',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Department+of+Finance+Canada&dept=departmentfinance&format=atom&orderBy=desc&pick=100&sort=publishedDate',
  },
  {
    label: 'Government of Canada · Business',
    category: 'Business & finance',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=business&audience=business&format=atom&orderBy=desc&pick=100&sort=publishedDate',
  },
  {
    label: 'Government of Canada',
    category: 'Canadian news',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=National+News&format=atom&orderBy=desc&pick=100&sort=publishedDate',
  },
];

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([\da-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
}

function plainText(value) {
  return decodeXml(value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function parseEntries(xml, source) {
  const entries = [...xml.matchAll(/<(entry|item)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  return entries.flatMap(([, , block]) => {
    const headline = plainText(tag(block, 'title'));
    const author = plainText(tag(block, 'name')) || plainText(tag(block, 'creator')) || source.label;
    const url = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1]
      ?? tag(block, 'link') ?? tag(block, 'id');
    const publishedAt = tag(block, 'published') || tag(block, 'updated') || tag(block, 'pubDate');
    const description = plainText(tag(block, 'summary') || tag(block, 'description') || tag(block, 'content'));
    if (!headline || !url || !/^https:\/\//i.test(url) || !Number.isFinite(Date.parse(publishedAt))) return [];
    return [{
      id: url,
      headline,
      category: source.category,
      source: author === source.label ? source.label : `${source.label} · ${author}`,
      publishedAt: new Date(publishedAt).toISOString(),
      description: description.slice(0, 480),
      url,
      mode: 'live',
    }];
  });
}

async function fetchSource(source) {
  try {
    const response = await fetch(source.url, { headers: { Accept: 'application/atom+xml, application/xml, text/xml' }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const stories = parseEntries(xml, source);
    if (!stories.length) throw new Error('Feed returned no valid stories');
    return { stories, error: null };
  } catch (error) {
    return { stories: [], error: `${source.label}: ${error instanceof Error ? error.message : 'feed unavailable'}` };
  }
}

const fetched = await Promise.all(sources.map(fetchSource));
const seen = new Set();
const stories = fetched.flatMap(result => result.stories)
  .filter(story => {
    const key = story.url.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  .slice(0, 100);

const payload = {
  generatedAt: new Date().toISOString(),
  provider: 'Official Government of Canada RSS/Atom feeds',
  stories,
  errors: fetched.map(item => item.error).filter(Boolean),
};

const outputDir = process.argv.includes('--dev') ? 'public' : 'dist';
await mkdir(outputDir, { recursive: true });
await writeFile(`${outputDir}/news.json`, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${stories.length} official news stories from ${fetched.length - payload.errors.length}/${fetched.length} feeds.`);
for (const error of payload.errors) console.warn(error);
