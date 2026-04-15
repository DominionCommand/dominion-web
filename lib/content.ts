import {
  getCommanderBySlug,
  getEventBySlug,
  getFactionBySlug,
  getFactionCommanders,
  getNewsItemBySlug,
  getWorldZoneBySlug,
  siteContent,
} from '../packages/content/src/siteContent';

export type {
  Commander,
  EventCampaign,
  Faction,
  FaqItem,
  MediaItem,
  NewsItem,
  PressAsset,
  RoadmapItem,
  SeasonBeat,
  WorldZone,
} from '../packages/content/src/siteContent';

export {
  siteContent,
  getFactionBySlug,
  getCommanderBySlug,
  getFactionCommanders,
  getWorldZoneBySlug,
  getEventBySlug,
  getNewsItemBySlug,
};
