import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { STARTUP_BY_SLUG_QUERY } from "@/sanity/lib/startupQueries";

interface RouteParams {
  params: {
    startupId: string;
  };
}

// GET /api/startups/[startupId] - Get startup by ID or slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { startupId } = params;
    const { userId } = await auth();

    // Try to get startup by ID first, then by slug
    let startup;
    
    if (startupId.includes('-')) {
      // Likely a slug
      startup = await client
        .withConfig({ useCdn: false })
        .fetch(STARTUP_BY_SLUG_QUERY, { slug: startupId });
    } else {
      // Likely an ID
      startup = await client
        .withConfig({ useCdn: false })
        .fetch(
          `*[_type == "startup" && _id == $startupId][0] {
            _id,
            name,
            slug,
            tagline,
            description,
            logo,
            coverImage,
            industry,
            stage,
            foundedYear,
            teamSize,
            location,
            businessModel,
            revenueModel,
            targetMarket,
            totalFunding,
            lastFundingDate,
            valuation,
            website,
            productDemo,
            techStack,
            socialLinks,
            status,
            visibility,
            featured,
            verified,
            metrics,
            pitch,
            views,
            createdAt,
            updatedAt,
            founders[]->{
              _id,
              userId,
              role,
              bio,
              company,
              position,
              skills,
              socialLinks,
              profileImage
            },
            teamMembers[]->{
              _id,
              userId,
              role,
              company,
              position,
              profileImage
            },
            investors,
            "fundingRounds": *[_type == "fundingRound" && references(^._id)] | order(announcedDate desc) {
              _id,
              roundType,
              amount,
              currency,
              announcedDate,
              closedDate,
              preMoneyValuation,
              postMoneyValuation,
              leadInvestors,
              participatingInvestors,
              useOfFunds,
              status,
              verified
            }
          }`,
          { startupId }
        );
    }

    if (!startup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const isFounder = startup.founders?.some((founder: any) => founder.userId === userId);
    const canViewPrivate = isFounder; // For now, only founders can view private startups

    if (startup.visibility === 'private' && !canViewPrivate) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    if (startup.visibility === 'investors' && !userId) {
      return NextResponse.json(
        { error: "Authentication required to view this startup" },
        { status: 401 }
      );
    }

    if (startup.visibility === 'community' && !userId) {
      return NextResponse.json(
        { error: "Community membership required to view this startup" },
        { status: 401 }
      );
    }

    // Increment view count (only for public access)
    if (startup.visibility === 'public') {
      try {
        await writeClient
          .patch(startup._id)
          .inc({ views: 1 })
          .set({ updatedAt: new Date().toISOString() })
          .commit();
      } catch (error) {
        console.error("Error incrementing view count:", error);
        // Don't fail the request if view count update fails
      }
    }

    return NextResponse.json(startup);
  } catch (error) {
    console.error("Error fetching startup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/startups/[startupId] - Update startup
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    const { startupId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing startup
    const existingStartup = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "startup" && _id == $startupId][0] {
          _id,
          name,
          founders[]->{
            _id,
            userId
          },
          status
        }`,
        { startupId }
      );

    if (!existingStartup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    // Check permissions - founder can edit
    const isFounder = existingStartup.founders?.some((founder: any) => founder.userId === userId);

    if (!isFounder) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit this startup" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define allowed fields for regular users vs admins
    let allowedFields = [
      'name', 'tagline', 'description', 'logo', 'coverImage', 'industry', 'stage',
      'foundedYear', 'teamSize', 'location', 'businessModel', 'revenueModel',
      'targetMarket', 'website', 'productDemo', 'techStack', 'socialLinks',
      'metrics', 'pitch', 'teamMembers', 'investors', 'totalFunding', 'valuation',
      'lastFundingDate', 'visibility'
    ];

    // For now, regular users can edit all allowed fields
    // TODO: Implement admin-only fields with Clerk roles

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'teamMembers' && Array.isArray(body[field])) {
          updateData[field] = body[field].map((id: string) => ({
            _type: "reference",
            _ref: id,
          }));
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Update slug if name changed
    if (body.name && body.name !== existingStartup.name) {
      updateData.slug = {
        _type: "slug",
        current: body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      };
    }

    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update startup
    const updatedStartup = await writeClient
      .patch(startupId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedStartup);
  } catch (error) {
    console.error("Error updating startup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/startups/[startupId] - Delete startup
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    const { startupId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing startup
    const existingStartup = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "startup" && _id == $startupId][0] {
          _id,
          name,
          founders[]->{
            _id,
            userId
          },
          "hasFundingRounds": count(*[_type == "fundingRound" && references(^._id)]) > 0,
          "hasEvents": count(*[_type == "event" && references(^._id)]) > 0,
          "hasResources": count(*[_type == "resource" && references(^._id)]) > 0
        }`,
        { startupId }
      );

    if (!existingStartup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    // Check permissions - founder can delete
    const isFounder = existingStartup.founders?.some((founder: any) => founder.userId === userId);

    if (!isFounder) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete this startup" },
        { status: 403 }
      );
    }

    // Prevent deletion if startup has related data
    if (existingStartup.hasFundingRounds || existingStartup.hasEvents || existingStartup.hasResources) {
      return NextResponse.json(
        { error: "Cannot delete startup with funding rounds, events, or resources. Archive it instead." },
        { status: 400 }
      );
    }

    // Delete the startup
    await writeClient.delete(startupId);

    return NextResponse.json(
      { message: "Startup deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting startup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
