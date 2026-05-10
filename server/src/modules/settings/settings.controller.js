import { SettingsService } from "./settings.service.js";
import { success } from "../../shared/helpers/response.js";

const settingsService = new SettingsService();

export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getPublic();
    success(res, settings);
  } catch (err) { next(err); }
};

export const getAllSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getAll();
    success(res, settings);
  } catch (err) { next(err); }
};

export const updateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const row = await settingsService.update(key, value);
    success(res, row, "Setting updated");
  } catch (err) { next(err); }
};

export const updateManySettings = async (req, res, next) => {
  try {
    const { settings } = req.body; // [{ key, value }, ...]
    const rows = await settingsService.updateMany(settings);
    success(res, rows, "Settings saved");
  } catch (err) { next(err); }
};
