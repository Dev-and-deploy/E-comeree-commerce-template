export const PERMISSIONS = {
  // Dashboard — financial data is sensitive; only roles that manage the business see it
  DASHBOARD_VIEW: "dashboard:view",
  DASHBOARD_FINANCIAL: "dashboard:financial",

  // Catalog — all admin roles can manage products & categories
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_MANAGE: "categories:manage",

  // Operations — editors don't process orders or handle payments
  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",

  // Customers — editors don't need access to customer data
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",

  // Staff management — only SUPER_ADMIN creates/edits other admins
  ADMINS_VIEW: "admins:view",
  ADMINS_MANAGE: "admins:manage",

  // Marketing — editors don't control promotions or discounts
  MARKETING_VIEW: "marketing:view",
  MARKETING_MANAGE: "marketing:manage",
  DISCOUNTS_VIEW: "discounts:view",
  DISCOUNTS_MANAGE: "discounts:manage",

  // Content — all admin roles can write blog posts
  BLOGS_VIEW: "blogs:view",
  BLOGS_MANAGE: "blogs:manage",

  // Appearance — design decisions stay with store managers and above
  THEME_VIEW: "theme:view",
  THEME_MANAGE: "theme:manage",
  TEMPLATES_VIEW: "templates:view",
  TEMPLATES_MANAGE: "templates:manage",

  // System — only SUPER_ADMIN touches infrastructure config
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
};

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),

  // Store manager: full operational access, no staff management, no system settings
  ADMIN: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_FINANCIAL,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.MARKETING_VIEW,
    PERMISSIONS.MARKETING_MANAGE,
    PERMISSIONS.DISCOUNTS_VIEW,
    PERMISSIONS.DISCOUNTS_MANAGE,
    PERMISSIONS.BLOGS_VIEW,
    PERMISSIONS.BLOGS_MANAGE,
    PERMISSIONS.THEME_VIEW,
    PERMISSIONS.THEME_MANAGE,
    PERMISSIONS.TEMPLATES_VIEW,
    PERMISSIONS.TEMPLATES_MANAGE,
  ],

  // Content/catalog manager: catalog + content only, no financial or customer data
  EDITOR: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.BLOGS_VIEW,
    PERMISSIONS.BLOGS_MANAGE,
  ],
};

export const hasPermission = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes(permission);
};
