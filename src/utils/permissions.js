const SUPER_ADMIN_ROLE = 'super-admin'

/**
 * Mirrors the backend policy convention: a module-level manage permission
 * grants the module's granular capabilities, while super-admin bypasses all.
 */
export function hasCapability(user, permission, managePermission) {
  if (user?.roles?.includes(SUPER_ADMIN_ROLE)) return true

  const permissions = user?.permissions ?? []

  return permissions.includes(permission) || (managePermission && permissions.includes(managePermission))
}

export function hasAnyCapability(user, permissions, managePermission) {
  return permissions.some((permission) => hasCapability(user, permission, managePermission))
}
