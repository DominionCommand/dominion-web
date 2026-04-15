import { siteContent } from './content';
import type { MediaItem, NewsItem, PressAsset } from '../packages/content/src/siteContent';

type MediaStatus = MediaItem['status'];
type MediaType = MediaItem['type'];
type PressStatus = PressAsset['status'];
type PressType = PressAsset['type'];

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {} as Record<T, number>);
}

function sortNewsDescending(items: NewsItem[]) {
  return items
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.title.localeCompare(b.title));
}

function summarizeMedia(items: MediaItem[]) {
  const byStatus = countBy(items.map((item) => item.status));
  const byType = countBy(items.map((item) => item.type));
  const readyItems = items.filter((item) => item.status === 'ready');
  const inProgressItems = items.filter((item) => item.status === 'in-progress');

  return {
    total: items.length,
    byStatus: {
      planned: byStatus.planned ?? 0,
      'in-progress': byStatus['in-progress'] ?? 0,
      ready: byStatus.ready ?? 0,
    } satisfies Record<MediaStatus, number>,
    byType: {
      'key-art': byType['key-art'] ?? 0,
      screenshot: byType.screenshot ?? 0,
      trailer: byType.trailer ?? 0,
      ui: byType.ui ?? 0,
    } satisfies Record<MediaType, number>,
    readyItems,
    inProgressItems,
    highlight:
      readyItems[0] ??
      inProgressItems[0] ??
      items[0] ??
      null,
  };
}

function summarizePress(assets: PressAsset[]) {
  const byStatus = countBy(assets.map((asset) => asset.status));
  const byType = countBy(assets.map((asset) => asset.type));
  const availableAssets = assets.filter((asset) => asset.status === 'available');

  return {
    contactEmail: siteContent.press.contactEmail,
    boilerplate: siteContent.press.boilerplate,
    total: assets.length,
    byStatus: {
      available: byStatus.available ?? 0,
      'in-progress': byStatus['in-progress'] ?? 0,
    } satisfies Record<PressStatus, number>,
    byType: {
      logo: byType.logo ?? 0,
      'key-art': byType['key-art'] ?? 0,
      'fact-sheet': byType['fact-sheet'] ?? 0,
      screens: byType.screens ?? 0,
      trailer: byType.trailer ?? 0,
    } satisfies Record<PressType, number>,
    availableAssets,
    highlight: availableAssets[0] ?? assets[0] ?? null,
  };
}

function summarizeNews(items: NewsItem[]) {
  const sorted = sortNewsDescending(items);
  const tagCounts = countBy(sorted.map((item) => item.tag));

  return {
    total: sorted.length,
    latest: sorted[0] ?? null,
    tagCounts,
    timeline: sorted,
  };
}

export function buildPublicKitSnapshot() {
  const media = summarizeMedia(siteContent.media);
  const press = summarizePress(siteContent.press.assets);
  const news = summarizeNews(siteContent.news);

  return {
    generatedAt: new Date().toISOString(),
    meta: {
      title: siteContent.hero.title,
      description: siteContent.hero.description,
      factions: siteContent.factions.length,
      commanders: siteContent.commanders.length,
      events: siteContent.events.length,
    },
    media,
    press,
    news,
    spotlight: {
      news: news.latest,
      media: media.highlight,
      press: press.highlight,
    },
  };
}
