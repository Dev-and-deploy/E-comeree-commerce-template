import { ProductService } from "./product.service.js";
import { success, created, noContent, paginated } from "../../shared/helpers/response.js";

const productService = new ProductService();

export const getProducts = async (req, res, next) => {
  try {
    const { products, pagination } = await productService.getProducts(req.query);
    paginated(res, products, pagination);
  } catch (err) { next(err); }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.slug);
    success(res, product);
  } catch (err) { next(err); }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    created(res, product, "Product created");
  } catch (err) { next(err); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    success(res, product, "Product updated");
  } catch (err) { next(err); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    noContent(res);
  } catch (err) { next(err); }
};

export const getAdminProducts = async (req, res, next) => {
  try {
    const { products, pagination } = await productService.getAdminProducts(req.query);
    paginated(res, products, pagination);
  } catch (err) { next(err); }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    success(res, categories);
  } catch (err) { next(err); }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await productService.createCategory(req.body);
    created(res, category, "Category created");
  } catch (err) { next(err); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await productService.updateCategory(req.params.id, req.body);
    success(res, category, "Category updated");
  } catch (err) { next(err); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await productService.deleteCategory(req.params.id);
    noContent(res);
  } catch (err) { next(err); }
};
