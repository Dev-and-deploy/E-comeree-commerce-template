import { ApiError } from "../errors/ApiError.js";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.slice(1).join("."),
      message: e.message,
    }));
    return next(ApiError.badRequest("Validation failed", errors));
  }
  req.validated = result.data;
  next();
};
