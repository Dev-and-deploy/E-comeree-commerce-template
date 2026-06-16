import { BlogService } from "./blog.service.js";
import { success, created, noContent, paginated } from "../../shared/helpers/response.js";

const blogService = new BlogService();

export const getBlogs = async (req, res, next) => {
  try {
    const { blogs, pagination } = await blogService.getBlogs(req.query);
    paginated(res, blogs, pagination);
  } catch (err) { next(err); }
};

export const getBlog = async (req, res, next) => {
  try {
    const blog = await blogService.getBlog(req.params.slug);
    success(res, blog);
  } catch (err) { next(err); }
};

export const getAdminBlogs = async (req, res, next) => {
  try {
    const { blogs, pagination } = await blogService.getAdminBlogs(req.query);
    paginated(res, blogs, pagination);
  } catch (err) { next(err); }
};

export const createBlog = async (req, res, next) => {
  try {
    const blog = await blogService.createBlog(req.body);
    created(res, blog, "Blog post created");
  } catch (err) { next(err); }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await blogService.updateBlog(req.params.id, req.body);
    success(res, blog, "Blog post updated");
  } catch (err) { next(err); }
};

export const deleteBlog = async (req, res, next) => {
  try {
    await blogService.deleteBlog(req.params.id);
    noContent(res);
  } catch (err) { next(err); }
};
