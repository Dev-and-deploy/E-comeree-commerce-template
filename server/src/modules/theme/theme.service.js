import { ThemeRepository } from "./theme.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { cacheGet, cacheSet, cacheDel } from "../../core/cache/redis.js";

const THEME_CACHE_KEY = "theme:active";

export class ThemeService {
  constructor() {
    this.repo = new ThemeRepository();
  }

  async getActiveTheme() {
    const cached = await cacheGet(THEME_CACHE_KEY);
    if (cached) return cached;

    const theme = await this.repo.getActive();
    if (!theme) throw ApiError.notFound("No active theme configured");

    await cacheSet(THEME_CACHE_KEY, theme, 600);
    return theme;
  }

  getAllThemes() {
    return this.repo.getAll();
  }

  async updateTheme(id, data) {
    const theme = await this.repo.getById(id);
    if (!theme) throw ApiError.notFound("Theme not found");
    const updated = await this.repo.update(id, data);
    await cacheDel(THEME_CACHE_KEY);
    return updated;
  }

  async createTheme(data) {
    const theme = await this.repo.create(data);
    return theme;
  }

  async activateTheme(id) {
    await this.repo.activate(id);
    await cacheDel(THEME_CACHE_KEY);
    return this.repo.getById(id);
  }

  getTemplates() {
    return this.repo.getTemplates();
  }

  async getAdminSettings() {
    const settings = await this.repo.getAdminSettings();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  async updateAdminSetting(key, value) {
    return this.repo.upsertAdminSetting(key, String(value));
  }
}
