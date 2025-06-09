import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role, Permission, hasPermission, hasAnyPermission } from "@/lib/permissions";

// Types for middleware configuration
export interface AuthMiddlewareConfig {
  requireAuth?: boolean;
  requiredRole?: Role;
  requiredPermissions?: Permission[];
  requireAnyPermission?: boolean; // If true, user needs ANY of the permissions, not ALL
}

// Auth middleware function
export async function withAuth(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  config: AuthMiddlewareConfig = {}
) {
  return async (request: NextRequest, context?: any) => {
    try {
      const session = await auth();

      // Check if authentication is required
      if (config.requireAuth && !session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Check role requirement
      if (config.requiredRole && session?.user?.role !== config.requiredRole) {
        return NextResponse.json(
          { error: `Role '${config.requiredRole}' required` },
          { status: 403 }
        );
      }

      // Check permission requirements
      if (config.requiredPermissions && config.requiredPermissions.length > 0) {
        const userRole = session?.user?.role || Role.USER;
        
        let hasRequiredPermissions = false;
        
        if (config.requireAnyPermission) {
          // User needs ANY of the specified permissions
          hasRequiredPermissions = hasAnyPermission(userRole, config.requiredPermissions);
        } else {
          // User needs ALL of the specified permissions
          hasRequiredPermissions = config.requiredPermissions.every(permission =>
            hasPermission(userRole, permission)
          );
        }

        if (!hasRequiredPermissions) {
          return NextResponse.json(
            { error: "Insufficient permissions" },
            { status: 403 }
          );
        }
      }

      // Add user info to request context
      const enhancedContext = {
        ...context,
        user: session?.user,
        session,
      };

      return handler(request, enhancedContext);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

// Convenience functions for common auth patterns
export function requireAuth(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(handler, { requireAuth: true });
}

export function requireRole(
  role: Role,
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(handler, { requireAuth: true, requiredRole: role });
}

export function requirePermission(
  permission: Permission,
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(handler, { 
    requireAuth: true, 
    requiredPermissions: [permission] 
  });
}

export function requirePermissions(
  permissions: Permission[],
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(handler, { 
    requireAuth: true, 
    requiredPermissions: permissions 
  });
}

export function requireAnyPermission(
  permissions: Permission[],
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(handler, { 
    requireAuth: true, 
    requiredPermissions: permissions,
    requireAnyPermission: true
  });
}

// Admin-only middleware
export function requireAdmin(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(handler, { requireAuth: true, requiredRole: Role.ADMIN });
}

// Moderator or Admin middleware
export function requireModerator(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(handler, { 
    requireAuth: true, 
    requiredPermissions: [Permission.MODERATE_CONTENT],
    requireAnyPermission: true
  });
}

// Helper function to check if user owns resource
export async function checkResourceOwnership(
  userId: string,
  resourceOwnerId: string,
  userRole?: Role
): Promise<boolean> {
  // User owns the resource
  if (userId === resourceOwnerId) {
    return true;
  }

  // Admins and moderators can access any resource
  if (userRole && (userRole === Role.ADMIN || userRole === Role.MODERATOR)) {
    return true;
  }

  return false;
}

// Middleware for resource ownership or admin access
export function requireOwnershipOrAdmin(
  getResourceOwnerId: (request: NextRequest, context?: any) => Promise<string>,
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(async (request: NextRequest, context?: any) => {
    try {
      const resourceOwnerId = await getResourceOwnerId(request, context);
      const userId = context?.user?.id;
      const userRole = context?.user?.role;

      if (!checkResourceOwnership(userId, resourceOwnerId, userRole)) {
        return NextResponse.json(
          { error: "Access denied: You can only access your own resources" },
          { status: 403 }
        );
      }

      return handler(request, context);
    } catch (error) {
      console.error("Ownership check error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }, { requireAuth: true });
}

// Type for enhanced request context
export interface AuthenticatedContext {
  user?: {
    id?: string;
    role?: Role;
    permissions?: Permission[];
  };
  session?: any;
}
