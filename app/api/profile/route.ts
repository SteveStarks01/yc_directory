import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile from Sanity
    const userProfile = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "userProfile" && userId == $userId][0]`,
        { userId: session.id }
      );

    if (!userProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to edit their profile
    if (!hasPermission(session.user.role || Role.USER, Permission.EDIT_USER_PROFILE)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate and sanitize input
    const allowedFields = [
      'bio',
      'skills',
      'interests',
      'company',
      'position',
      'location',
      'socialLinks',
      'preferences'
    ];

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
        { userId: session.id }
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

// POST /api/profile - Create user profile (for migration purposes)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if profile already exists
    const existingProfile = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "userProfile" && userId == $userId][0]`,
        { userId: session.id }
      );

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 409 }
      );
    }

    // Create new profile
    const profileData = {
      _type: "userProfile",
      userId: session.id,
      role: body.role || Role.USER,
      bio: body.bio || "",
      skills: body.skills || [],
      interests: body.interests || [],
      company: body.company || "",
      position: body.position || "",
      location: body.location || "",
      socialLinks: body.socialLinks || {},
      preferences: {
        emailNotifications: body.preferences?.emailNotifications ?? true,
        profileVisibility: body.preferences?.profileVisibility || "community",
        showEmail: body.preferences?.showEmail ?? false,
      },
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isVerified: false,
      isActive: true,
    };

    const newProfile = await writeClient.create(profileData);

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
