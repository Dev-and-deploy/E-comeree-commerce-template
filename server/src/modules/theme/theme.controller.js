import { ThemeService } from "./theme.service.js";
import { success, created } from "../../shared/helpers/response.js";

const themeService = new ThemeService();

export const getActiveTheme = async (req, res, next) => {
  try {
    const theme = await themeService.getActiveTheme();
    success(res, theme);
  } catch (err) { next(err); }
};

export const getAllThemes = async (req, res, next) => {
  try {
    const themes = await themeService.getAllThemes();
    success(res, themes);
  } catch (err) { next(err); }
};

export const createTheme = async (req, res, next) => {
  try {
    const theme = await themeService.createTheme(req.body);
    created(res, theme, "Theme created");
  } catch (err) { next(err); }
};

export const updateTheme = async (req, res, next) => {
  try {
    const theme = await themeService.updateTheme(req.params.id, req.body);
    success(res, theme, "Theme updated");
  } catch (err) { next(err); }
};

export const activateTheme = async (req, res, next) => {
  try {
    const theme = await themeService.activateTheme(req.params.id);
    success(res, theme, "Theme activated");
  } catch (err) { next(err); }
};

export const getTemplates = async (req, res, next) => {
  try {
    const templates = await themeService.getTemplates();
    success(res, templates);
  } catch (err) { next(err); }
};

export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await themeService.getAdminSettings();
    success(res, settings);
  } catch (err) { next(err); }
};

export const updateAdminSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const setting = await themeService.updateAdminSetting(key, value);
    success(res, setting, "Setting updated");
  } catch (err) { next(err); }
};
