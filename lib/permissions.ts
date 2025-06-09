// Role-based permission system for YC Directory Community Features

export enum Permission {
  // Event permissions
  CREATE_EVENT = 'create:event',
  EDIT_EVENT = 'edit:event',
  DELETE_EVENT = 'delete:event',
  MANAGE_EVENT_ATTENDEES = 'manage:event:attendees',
  
  // Job board permissions
  CREATE_JOB = 'create:job',
  EDIT_JOB = 'edit:job',
  DELETE_JOB = 'delete:job',
  VIEW_JOB_APPLICATIONS = 'view:job:applications',
  MANAGE_JOB_APPLICATIONS = 'manage:job:applications',
  
  // Mentor network permissions
  BECOME_MENTOR = 'become:mentor',
  REQUEST_MENTORSHIP = 'request:mentorship',
  MANAGE_MENTORSHIP = 'manage:mentorship',
  
  // Resource library permissions
  CREATE_RESOURCE = 'create:resource',
  EDIT_RESOURCE = 'edit:resource',
  DELETE_RESOURCE = 'delete:resource',
  MODERATE_RESOURCE = 'moderate:resource',

  // Startup permissions
  CREATE_STARTUP = 'create:startup',
  EDIT_STARTUP = 'edit:startup',
  DELETE_STARTUP = 'delete:startup',

  // Pitch permissions
  CREATE_PITCH = 'create:pitch',
  EDIT_PITCH = 'edit:pitch',
  DELETE_PITCH = 'delete:pitch',
  MODERATE_PITCH = 'moderate:pitch',
  RATE_PITCH = 'rate:pitch',
  COMMENT_PITCH = 'comment:pitch',

  // Investor permissions
  CREATE_INVESTOR_PROFILE = 'create:investor-profile',
  EDIT_INVESTOR_PROFILE = 'edit:investor-profile',
  DELETE_INVESTOR_PROFILE = 'delete:investor-profile',
  CREATE_INVESTMENT_INTEREST = 'create:investment-interest',
  VIEW_INVESTMENT_INTERESTS = 'view:investment-interests',
  CREATE_CONNECTION_REQUEST = 'create:connection-request',
  RESPOND_CONNECTION_REQUEST = 'respond:connection-request',
  
  // User management permissions
  VIEW_USER_PROFILES = 'view:user:profiles',
  EDIT_USER_PROFILE = 'edit:user:profile',
  MANAGE_USER_ROLES = 'manage:user:roles',
  
  // Content moderation permissions
  MODERATE_CONTENT = 'moderate:content',
  DELETE_ANY_CONTENT = 'delete:any:content',
  BAN_USERS = 'ban:users',
  
  // Analytics permissions
  VIEW_ANALYTICS = 'view:analytics',
  VIEW_ADMIN_ANALYTICS = 'view:admin:analytics',
  
  // System administration
  ADMIN_SYSTEM = 'admin:system',
  MANAGE_PLATFORM = 'manage:platform',
}

export enum Role {
  USER = 'user',
  FOUNDER = 'founder',
  INVESTOR = 'investor',
  MENTOR = 'mentor',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

// Base permissions for each role
const basePermissions = {
  [Role.USER]: [
    Permission.VIEW_USER_PROFILES,
    Permission.EDIT_USER_PROFILE,
    Permission.REQUEST_MENTORSHIP,
    // Pitch permissions (users can comment)
    Permission.COMMENT_PITCH,
  ],

  [Role.FOUNDER]: [
    Permission.VIEW_USER_PROFILES,
    Permission.EDIT_USER_PROFILE,
    Permission.REQUEST_MENTORSHIP,
    // Event permissions
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    // Job permissions
    Permission.CREATE_JOB,
    Permission.EDIT_JOB,
    Permission.DELETE_JOB,
    Permission.VIEW_JOB_APPLICATIONS,
    Permission.MANAGE_JOB_APPLICATIONS,
    // Resource permissions
    Permission.CREATE_RESOURCE,
    Permission.EDIT_RESOURCE,
    Permission.DELETE_RESOURCE,
    // Startup permissions
    Permission.CREATE_STARTUP,
    Permission.EDIT_STARTUP,
    Permission.DELETE_STARTUP,
    // Pitch permissions
    Permission.CREATE_PITCH,
    Permission.EDIT_PITCH,
    Permission.DELETE_PITCH,
    Permission.RATE_PITCH,
    Permission.COMMENT_PITCH,
    // Connection permissions
    Permission.CREATE_CONNECTION_REQUEST,
    Permission.RESPOND_CONNECTION_REQUEST,
    Permission.VIEW_INVESTMENT_INTERESTS,
    // Analytics
    Permission.VIEW_ANALYTICS,
  ],

  [Role.INVESTOR]: [
    Permission.VIEW_USER_PROFILES,
    Permission.EDIT_USER_PROFILE,
    Permission.REQUEST_MENTORSHIP,
    // Event permissions
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    // Mentor permissions
    Permission.BECOME_MENTOR,
    Permission.MANAGE_MENTORSHIP,
    // Pitch permissions (investors can rate and comment)
    Permission.RATE_PITCH,
    Permission.COMMENT_PITCH,
    // Investor permissions
    Permission.CREATE_INVESTOR_PROFILE,
    Permission.EDIT_INVESTOR_PROFILE,
    Permission.DELETE_INVESTOR_PROFILE,
    Permission.CREATE_INVESTMENT_INTEREST,
    Permission.VIEW_INVESTMENT_INTERESTS,
    Permission.CREATE_CONNECTION_REQUEST,
    Permission.RESPOND_CONNECTION_REQUEST,
    // Analytics
    Permission.VIEW_ANALYTICS,
  ],

  [Role.MENTOR]: [
    Permission.VIEW_USER_PROFILES,
    Permission.EDIT_USER_PROFILE,
    Permission.REQUEST_MENTORSHIP,
    // Mentor permissions
    Permission.BECOME_MENTOR,
    Permission.MANAGE_MENTORSHIP,
    // Event permissions
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    // Resource permissions
    Permission.CREATE_RESOURCE,
    Permission.EDIT_RESOURCE,
    Permission.DELETE_RESOURCE,
    // Pitch permissions (mentors can rate and comment)
    Permission.RATE_PITCH,
    Permission.COMMENT_PITCH,
  ],

  [Role.MODERATOR]: [
    Permission.VIEW_USER_PROFILES,
    Permission.EDIT_USER_PROFILE,
    Permission.REQUEST_MENTORSHIP,
    Permission.BECOME_MENTOR,
    Permission.MANAGE_MENTORSHIP,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.CREATE_RESOURCE,
    Permission.EDIT_RESOURCE,
    Permission.DELETE_RESOURCE,
    // Moderation permissions
    Permission.MODERATE_CONTENT,
    Permission.MODERATE_RESOURCE,
    Permission.MANAGE_EVENT_ATTENDEES,
    // Analytics
    Permission.VIEW_ANALYTICS,
  ],

  [Role.ADMIN]: Object.values(Permission),
};

// Export the role permissions
export const rolePermissions: Record<Role, Permission[]> = basePermissions;

// Helper functions for permission checking
export function hasPermission(userRole: Role | string, permission: Permission): boolean {
  const role = userRole as Role;
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(userRole: Role | string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: Role | string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function getUserPermissions(userRole: Role | string): Permission[] {
  const role = userRole as Role;
  return rolePermissions[role] || [];
}

export function canAccessResource(userRole: Role | string, requiredPermissions: Permission[]): boolean {
  return hasAnyPermission(userRole, requiredPermissions);
}

// Role hierarchy for upgrades/downgrades
export const roleHierarchy: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.FOUNDER]: 2,
  [Role.INVESTOR]: 2,
  [Role.MENTOR]: 3,
  [Role.MODERATOR]: 4,
  [Role.ADMIN]: 5,
};

export function canManageRole(managerRole: Role | string, targetRole: Role | string): boolean {
  const managerLevel = roleHierarchy[managerRole as Role] || 0;
  const targetLevel = roleHierarchy[targetRole as Role] || 0;
  return managerLevel > targetLevel;
}

// Type definitions for better TypeScript support
export interface UserWithRole {
  id: string;
  role: Role;
  permissions?: Permission[];
}

export interface PermissionCheck {
  hasPermission: boolean;
  requiredRole?: Role;
  message?: string;
}
