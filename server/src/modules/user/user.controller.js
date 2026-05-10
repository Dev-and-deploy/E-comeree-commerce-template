import { UserService } from "./user.service.js";
import { success, noContent, paginated } from "../../shared/helpers/response.js";

const userService = new UserService();

export const getUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await userService.getUsers(req.query);
    paginated(res, users, pagination);
  } catch (err) { next(err); }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    success(res, user);
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    success(res, user, "User updated");
  } catch (err) { next(err); }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    noContent(res);
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    success(res, user, "Profile updated");
  } catch (err) { next(err); }
};
