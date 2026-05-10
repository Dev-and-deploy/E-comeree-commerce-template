import { CategoryService } from "./category.service.js";
import { success, created, noContent } from "../../shared/helpers/response.js";

const categoryService = new CategoryService();

export const getCategories = async (_req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    success(res, categories);
  } catch (err) { next(err); }
};

export const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(req.query);
    success(res, categories);
  } catch (err) { next(err); }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    created(res, category, "Category created");
  } catch (err) { next(err); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    success(res, category, "Category updated");
  } catch (err) { next(err); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    noContent(res);
  } catch (err) { next(err); }
};
