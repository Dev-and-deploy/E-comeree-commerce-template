import { AdminService } from "./admin.service.js";
import { success, created, paginated } from "../../shared/helpers/response.js";

const adminService = new AdminService();

export const getAdmins = async (req, res, next) => {
  try {
    const result = await adminService.getAdmins(req.query);
    paginated(res, result.data, result.pagination);
  } catch (err) { next(err); }
};

export const createAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.createAdmin(req.body, req.user);
    created(res, admin, "Admin created");
  } catch (err) { next(err); }
};

export const updateAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.updateAdmin(req.params.id, req.body, req.user);
    success(res, admin, "Admin updated");
  } catch (err) { next(err); }
};

export const toggleAdminActive = async (req, res, next) => {
  try {
    const admin = await adminService.toggleActive(req.params.id, req.user);
    success(res, admin, `Admin ${admin.isActive ? "activated" : "deactivated"}`);
  } catch (err) { next(err); }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.deleteAdmin(req.params.id, req.user);
    success(res, admin, "Admin deactivated");
  } catch (err) { next(err); }
};
