import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";

interface RouteParams {
  params: {
    resourceId: string;
  };
}

// GET /api/resources/[resourceId] - Get resource by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { resourceId } = params;
    const session = await auth();

    const resource = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "resource" && _id == $resourceId][0] {
          _id,
          title,
          slug,
          description,
          content,
          resourceType,
          thumbnailImage,
          file,
          externalUrl,
          category->{
            _id,
            name,
            slug,
            icon,
            color,
            description
          },
          additionalCategories[]->{
            _id,
            name,
            slug,
            icon,
            color
          },
          tags,
          difficulty,
          estimatedTime,
          price,
          requirements,
          featured,
          status,
          accessLevel,
          downloadCount,
          viewCount,
          rating,
          author->{
            _id,
            userId,
            role,
            bio,
            company,
            position,
            socialLinks
          },
          contributors[]->{
            _id,
            userId,
            role,
            company,
            position
          },
          createdAt,
          updatedAt,
          publishedAt
        }`,
        { resourceId }
      );

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const canViewDrafts = session?.user?.role && 
      (hasPermission(session.user.role, Permission.EDIT_RESOURCE) || 
       resource.author?.userId === session?.id);

    if (resource.status !== "published" && !canViewDrafts) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Check access level permissions
    if (!session && resource.accessLevel !== "public") {
      return NextResponse.json(
        { error: "Authentication required to access this resource" },
        { status: 401 }
      );
    }

    if (session && resource.accessLevel === "premium") {
      const userRole = session.user?.role || Role.USER;
      if (!hasPermission(userRole, Permission.VIEW_ANALYTICS)) { // Example premium permission
        return NextResponse.json(
          { error: "Premium access required" },
          { status: 403 }
        );
      }
    }

    if (session && resource.accessLevel === "restricted") {
      const userRole = session.user?.role || Role.USER;
      if (!hasPermission(userRole, Permission.ADMIN_SYSTEM)) {
        return NextResponse.json(
          { error: "Restricted access" },
          { status: 403 }
        );
      }
    }

    // Increment view count
    try {
      await writeClient
        .patch(resourceId)
        .inc({ viewCount: 1 })
        .commit();
    } catch (error) {
      console.error("Error incrementing view count:", error);
      // Don't fail the request if view count update fails
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/resources/[resourceId] - Update resource
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { resourceId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing resource
    const existingResource = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "resource" && _id == $resourceId][0] {
          _id,
          author->{
            _id,
            userId
          },
          status
        }`,
        { resourceId }
      );

    if (!existingResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Check permissions - author or admin can edit
    const isAuthor = existingResource.author?.userId === session.id;
    const canEditAnyResource = session.user.role && 
      hasPermission(session.user.role, Permission.EDIT_RESOURCE);

    if (!isAuthor && !canEditAnyResource) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit this resource" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define allowed fields for regular users vs admins
    let allowedFields = [
      'title', 'description', 'content', 'resourceType', 'category',
      'additionalCategories', 'tags', 'file', 'externalUrl', 'thumbnailImage',
      'contributors', 'difficulty', 'estimatedTime', 'price', 'requirements',
      'accessLevel'
    ];

    // Admins can edit additional fields
    if (canEditAnyResource) {
      allowedFields.push('featured', 'status');
    }

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'category' && body[field]) {
          updateData[field] = {
            _type: "reference",
            _ref: body[field],
          };
        } else if (field === 'additionalCategories' && Array.isArray(body[field])) {
          updateData[field] = body[field].map((id: string) => ({
            _type: "reference",
            _ref: id,
          }));
        } else if (field === 'contributors' && Array.isArray(body[field])) {
          updateData[field] = body[field].map((id: string) => ({
            _type: "reference",
            _ref: id,
          }));
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Update slug if title changed
    if (body.title && body.title !== existingResource.title) {
      updateData.slug = {
        _type: "slug",
        current: body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      };
    }

    // Set published date if status changed to published
    if (body.status === "published" && existingResource.status !== "published") {
      updateData.publishedAt = new Date().toISOString();
    }

    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update resource
    const updatedResource = await writeClient
      .patch(resourceId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[resourceId] - Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { resourceId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing resource
    const existingResource = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "resource" && _id == $resourceId][0] {
          _id,
          title,
          author->{
            _id,
            userId
          },
          "hasDownloads": count(*[_type == "resourceDownload" && references(^._id)]) > 0,
          "hasRatings": count(*[_type == "resourceRating" && references(^._id)]) > 0
        }`,
        { resourceId }
      );

    if (!existingResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Check permissions - author or admin can delete
    const isAuthor = existingResource.author?.userId === session.id;
    const canDeleteAnyResource = session.user.role && 
      hasPermission(session.user.role, Permission.DELETE_RESOURCE);

    if (!isAuthor && !canDeleteAnyResource) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete this resource" },
        { status: 403 }
      );
    }

    // Prevent deletion if resource has downloads or ratings (unless admin)
    if ((existingResource.hasDownloads || existingResource.hasRatings) && !canDeleteAnyResource) {
      return NextResponse.json(
        { error: "Cannot delete resource with downloads or ratings. Archive it instead." },
        { status: 400 }
      );
    }

    // Delete related records first
    const downloads = await client.fetch(
      `*[_type == "resourceDownload" && references($resourceId)]._id`,
      { resourceId }
    );

    const ratings = await client.fetch(
      `*[_type == "resourceRating" && references($resourceId)]._id`,
      { resourceId }
    );

    // Delete downloads
    for (const downloadId of downloads) {
      await writeClient.delete(downloadId);
    }

    // Delete ratings
    for (const ratingId of ratings) {
      await writeClient.delete(ratingId);
    }

    // Delete the resource
    await writeClient.delete(resourceId);

    return NextResponse.json(
      { message: "Resource deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
