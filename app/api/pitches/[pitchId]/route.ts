import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { PITCH_BY_SLUG_QUERY } from "@/sanity/lib/pitchQueries";

interface RouteParams {
  params: {
    pitchId: string;
  };
}

// GET /api/pitches/[pitchId] - Get pitch by ID or slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { pitchId } = params;
    const session = await auth();

    // Try to get pitch by ID first, then by slug
    let pitch;
    
    if (pitchId.includes('-')) {
      // Likely a slug
      pitch = await client
        .withConfig({ useCdn: false })
        .fetch(PITCH_BY_SLUG_QUERY, { slug: pitchId });
    } else {
      // Likely an ID
      pitch = await client
        .withConfig({ useCdn: false })
        .fetch(
          `*[_type == "pitch" && _id == $pitchId][0] {
            _id,
            title,
            slug,
            description,
            problem,
            solution,
            marketSize,
            businessModel,
            traction,
            competition,
            askAmount,
            useOfFunds,
            pitchVideo,
            pitchVideoUrl,
            pitchDeck,
            demoVideo,
            demoUrl,
            thumbnailImage,
            pitchType,
            stage,
            industry,
            tags,
            status,
            visibility,
            featured,
            pitchOrder,
            presentationDate,
            viewCount,
            likeCount,
            commentCount,
            averageRating,
            ratingCount,
            createdAt,
            updatedAt,
            submittedAt,
            approvedAt,
            startup->{
              _id,
              name,
              slug,
              tagline,
              logo,
              industry,
              stage,
              website
            },
            presenter->{
              _id,
              userId,
              role,
              bio,
              profileImage
            },
            additionalPresenters[]->{
              _id,
              userId,
              role,
              profileImage
            },
            event->{
              _id,
              title,
              slug,
              startDateTime,
              eventType
            }
          }`,
          { pitchId }
        );
    }

    if (!pitch) {
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const canViewPrivate = session?.user?.role && 
      (hasPermission(session.user.role, Permission.VIEW_ANALYTICS) || 
       pitch.presenter?.userId === session?.id ||
       pitch.additionalPresenters?.some((presenter: any) => presenter.userId === session?.id));

    if (pitch.visibility === 'private' && !canViewPrivate) {
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    if (pitch.visibility === 'investors' && !session) {
      return NextResponse.json(
        { error: "Authentication required to view this pitch" },
        { status: 401 }
      );
    }

    if (pitch.visibility === 'community' && !session) {
      return NextResponse.json(
        { error: "Community membership required to view this pitch" },
        { status: 401 }
      );
    }

    if (pitch.status === 'draft' && !canViewPrivate) {
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    // Increment view count (only for approved/presented pitches)
    if (pitch.status === 'approved' || pitch.status === 'presented') {
      try {
        await writeClient
          .patch(pitch._id)
          .inc({ viewCount: 1 })
          .set({ updatedAt: new Date().toISOString() })
          .commit();
      } catch (error) {
        console.error("Error incrementing view count:", error);
        // Don't fail the request if view count update fails
      }
    }

    return NextResponse.json(pitch);
  } catch (error) {
    console.error("Error fetching pitch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/pitches/[pitchId] - Update pitch
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { pitchId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing pitch
    const existingPitch = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "pitch" && _id == $pitchId][0] {
          _id,
          title,
          status,
          presenter->{
            _id,
            userId
          },
          additionalPresenters[]->{
            _id,
            userId
          }
        }`,
        { pitchId }
      );

    if (!existingPitch) {
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    // Check permissions - presenter or admin can edit
    const isPresenter = existingPitch.presenter?.userId === session.id ||
                       existingPitch.additionalPresenters?.some((presenter: any) => presenter.userId === session.id);
    const canEditAnyPitch = session.user.role && 
      hasPermission(session.user.role, Permission.EDIT_PITCH);

    if (!isPresenter && !canEditAnyPitch) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit this pitch" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define allowed fields for regular users vs admins
    let allowedFields = [
      'title', 'description', 'problem', 'solution', 'marketSize', 'businessModel',
      'traction', 'competition', 'askAmount', 'useOfFunds', 'pitchVideoUrl',
      'demoUrl', 'thumbnailImage', 'pitchType', 'stage', 'industry', 'tags',
      'visibility', 'additionalPresenters', 'presentationDate', 'pitchOrder'
    ];

    // Admins can edit additional fields
    if (canEditAnyPitch) {
      allowedFields.push('featured', 'status', 'event');
    }

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'additionalPresenters' && Array.isArray(body[field])) {
          updateData[field] = body[field].map((id: string) => ({
            _type: "reference",
            _ref: id,
          }));
        } else if (field === 'event' && body[field]) {
          updateData[field] = {
            _type: "reference",
            _ref: body[field],
          };
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Update slug if title changed
    if (body.title && body.title !== existingPitch.title) {
      updateData.slug = {
        _type: "slug",
        current: body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      };
    }

    // Set submission date if status changed to submitted
    if (body.status === "submitted" && existingPitch.status !== "submitted") {
      updateData.submittedAt = new Date().toISOString();
    }

    // Set approval date if status changed to approved
    if (body.status === "approved" && existingPitch.status !== "approved") {
      updateData.approvedAt = new Date().toISOString();
    }

    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update pitch
    const updatedPitch = await writeClient
      .patch(pitchId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedPitch);
  } catch (error) {
    console.error("Error updating pitch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/pitches/[pitchId] - Delete pitch
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { pitchId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing pitch
    const existingPitch = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "pitch" && _id == $pitchId][0] {
          _id,
          title,
          status,
          presenter->{
            _id,
            userId
          },
          additionalPresenters[]->{
            _id,
            userId
          },
          "hasRatings": count(*[_type == "pitchRating" && references(^._id)]) > 0,
          "hasComments": count(*[_type == "pitchComment" && references(^._id)]) > 0
        }`,
        { pitchId }
      );

    if (!existingPitch) {
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    // Check permissions - presenter or admin can delete
    const isPresenter = existingPitch.presenter?.userId === session.id ||
                       existingPitch.additionalPresenters?.some((presenter: any) => presenter.userId === session.id);
    const canDeleteAnyPitch = session.user.role && 
      hasPermission(session.user.role, Permission.DELETE_PITCH);

    if (!isPresenter && !canDeleteAnyPitch) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete this pitch" },
        { status: 403 }
      );
    }

    // Prevent deletion if pitch has ratings or comments (unless admin)
    if ((existingPitch.hasRatings || existingPitch.hasComments) && !canDeleteAnyPitch) {
      return NextResponse.json(
        { error: "Cannot delete pitch with ratings or comments. Archive it instead." },
        { status: 400 }
      );
    }

    // Delete related records first (if admin)
    if (canDeleteAnyPitch) {
      const [ratings, comments] = await Promise.all([
        client.fetch(`*[_type == "pitchRating" && references($pitchId)]._id`, { pitchId }),
        client.fetch(`*[_type == "pitchComment" && references($pitchId)]._id`, { pitchId }),
      ]);

      // Delete ratings
      for (const ratingId of ratings) {
        await writeClient.delete(ratingId);
      }

      // Delete comments
      for (const commentId of comments) {
        await writeClient.delete(commentId);
      }
    }

    // Delete the pitch
    await writeClient.delete(pitchId);

    return NextResponse.json(
      { message: "Pitch deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting pitch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
