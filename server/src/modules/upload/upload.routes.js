import { Router } from "express";
import { upload } from "./upload.middleware.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { ADMIN_ROLES } from "../../shared/constants/roles.js";

const router = Router();

router.use(authenticate, authorize(...ADMIN_ROLES));

router.post("/", upload.single("file"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ data: { url } });
  } catch (err) {
    next(err);
  }
});

export default router;
