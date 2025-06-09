import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";

interface RouteParams {
  params: {
    userId: string;
  };
}

// GET /api/profile/[userId] - Get user profile by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { userId } = params;

    // Get user profile from Sanity
    const userProfile = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "userProfile" && userId == $userId][0]`,
        { userId }
      );

    if (!userProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check profile visibility
    const isOwnProfile = session?.id === userId;
    const canViewProfiles = session?.user?.role && 
      hasPermission(session.user.role, Permission.VIEW_USER_PROFILES);

    if (!isOwnProfile && !canViewProfiles) {
      return NextResponse.json(
        { error: "Unauthorized to view this profile" },
        { status: 403 }
      );
    }

    // Filter sensitive information based on privacy settings
    let filteredProfile = { ...userProfile };

    if (!isOwnProfile) {
      // Apply privacy filters for non-owners
      if (userProfile.preferences?.profileVisibility === "private") {
        return NextResponse.json(
          { error: "Profile is private" },
          { status: 403 }
        );
      }

      if (userProfile.preferences?.profileVisibility === "community" && !session) {
        return NextResponse.json(
          { error: "Must be logged in to view community profiles" },
          { status: 401 }
        );
      }

      // Remove sensitive fields for non-owners
      delete filteredProfile.preferences;
      delete filteredProfile.isVerified;
      delete filteredProfile.isActive;
      delete filteredProfile.lastActive;

      // Hide email if user preference is set
      if (!userProfile.preferences?.showEmail) {
        delete filteredProfile.email;
      }
    }

    return NextResponse.json(filteredProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile/[userId] - Update user profile by ID (admin only)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { userId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isOwnProfile = session.id === userId;
    const canManageUsers = session.user.role && 
      hasPermission(session.user.role, Permission.MANAGE_USER_ROLES);

    // Users can only edit their own profile, unless they're admin/moderator
    if (!isOwnProfile && !canManageUsers) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Define allowed fields based on permissions
    let allowedFields = [
      'bio',
      'skills',
      'interests',
      'company',
      'position',
      'location',
      'socialLinks',
      'preferences'
    ];

    // Admins can edit additional fields
    if (canManageUsers) {
      allowedFields.push('role', 'isVerified', 'isActive');
    }

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Add lastActive timestamp
    updateData.lastActive = new Date().toISOString();

    // Find existing profile
    const existingProfile = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "userProfile" && userId == $userId][0]`,
        { userId }
      );

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Update profile
    const updatedProfile = await writeClient
      .patch(existingProfile._id)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/[userId] - Delete user profile (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { userId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can delete profiles
    if (!hasPermission(session.user.role || Role.USER, Permission.ADMIN_SYSTEM)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Find existing profile
    const existingProfile = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "userProfile" && userId == $userId][0]`,
        { userId }
      );

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Delete profile
    await writeClient.delete(existingProfile._id);

    return NextResponse.json(
      { message: "Profile deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
