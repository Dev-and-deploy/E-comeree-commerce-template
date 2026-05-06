import { SettingsRepository } from "./settings.repository.js";
import { cacheGet, cacheSet, cacheDel } from "../../core/cache/redis.js";

const CACHE_KEY = "settings:public";
const CACHE_TTL = 300;

const DEFAULTS = {
  currency: "USD",
  taxRate: "10",
  freeShippingThreshold: "0",
  siteTitle: "MyStore",
  siteDescription: "Premium e-commerce store",
  contactEmail: "",
  maintenanceMode: "false",
  emailNotifications: "true",
  lowStockThreshold: "5",
  allowGuestCheckout: "true",
};

export class SettingsService {
  constructor() {
    this.repo = new SettingsRepository();
  }

  async getAll() {
    const rows = await this.repo.getAll();
    const stored = rows.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    return { ...DEFAULTS, ...stored };
  }

  async getPublic() {
    const cached = await cacheGet(CACHE_KEY);
    if (cached) return cached;

    const rows = await this.repo.getPublic();
    const stored = rows.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    const result = { ...DEFAULTS, ...stored };

    await cacheSet(CACHE_KEY, result, CACHE_TTL);
    return result;
  }

  async update(key, value) {
    const row = await this.repo.upsert(key, String(value));
    await cacheDel(CACHE_KEY);
    return row;
  }

  async updateMany(entries) {
    const rows = await this.repo.upsertMany(entries);
    await cacheDel(CACHE_KEY);
    return rows;
  }
}
