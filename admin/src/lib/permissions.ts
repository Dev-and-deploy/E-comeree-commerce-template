export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",
  DASHBOARD_FINANCIAL: "dashboard:financial",

  // Catalog
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_MANAGE: "categories:manage",

  // Operations
  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",

  // Customers
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",

  // Staff management
  ADMINS_VIEW: "admins:view",
  ADMINS_MANAGE: "admins:manage",

  // Marketing
  MARKETING_VIEW: "marketing:view",
  MARKETING_MANAGE: "marketing:manage",
  DISCOUNTS_VIEW: "discounts:view",
  DISCOUNTS_MANAGE: "discounts:manage",

  // Content
  BLOGS_VIEW: "blogs:view",
  BLOGS_MANAGE: "blogs:manage",

  // Appearance
  THEME_VIEW: "theme:view",
  THEME_MANAGE: "theme:manage",
  TEMPLATES_VIEW: "templates:view",
  TEMPLATES_MANAGE: "templates:manage",

  // System
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL = Object.values(PERMISSIONS) as Permission[];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: ALL,

  // Store manager: full operations, no staff management, no system settings
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

  // Content/catalog manager: catalog + blogs only, no financial or customer data
  EDITOR: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.BLOGS_VIEW,
    PERMISSIONS.BLOGS_MANAGE,
  ],
};

export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  return ROLE_PERMISSIONS[normalized]?.includes(permission) ?? false;
}

export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role.toUpperCase()] ?? [];
}
