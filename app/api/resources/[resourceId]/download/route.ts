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

// POST /api/resources/[resourceId]/download - Track resource download
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { resourceId } = params;
    const session = await auth();

    // Get resource details
    const resource = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "resource" && _id == $resourceId][0] {
          _id,
          title,
          status,
          accessLevel,
          file,
          externalUrl,
          downloadCount,
          author->{
            _id,
            userId
          }
        }`,
        { resourceId }
      );

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Check if resource is published
    if (resource.status !== "published") {
      return NextResponse.json(
        { error: "Resource is not available for download" },
        { status: 400 }
      );
    }

    // Check access permissions
    if (!session && resource.accessLevel !== "public") {
      return NextResponse.json(
        { error: "Authentication required to download this resource" },
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

    // Get user profile if authenticated
    let userProfile = null;
    if (session?.id) {
      userProfile = await client
        .withConfig({ useCdn: false })
        .fetch(
          `*[_type == "userProfile" && userId == $userId][0]`,
          { userId: session.id }
        );
    }

    // Get request metadata
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Determine download method
    let downloadMethod = "direct";
    let downloadUrl = "";
    
    if (resource.file) {
      downloadMethod = "direct";
      // In a real implementation, you'd generate a secure download URL
      downloadUrl = resource.file.asset?.url || "";
    } else if (resource.externalUrl) {
      downloadMethod = "external";
      downloadUrl = resource.externalUrl;
    } else {
      return NextResponse.json(
        { error: "No download available for this resource" },
        { status: 400 }
      );
    }

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent);

    // Create download record
    const downloadData = {
      _type: "resourceDownload",
      resource: {
        _type: "reference",
        _ref: resourceId,
      },
      user: userProfile ? {
        _type: "reference",
        _ref: userProfile._id,
      } : null,
      downloadedAt: new Date().toISOString(),
      ipAddress,
      userAgent,
      referrer: referer,
      downloadMethod,
      successful: true,
      sessionId: generateSessionId(),
      metadata: {
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        // In a real implementation, you'd add geolocation data
        country: "Unknown",
        city: "Unknown",
      },
    };

    // Save download record
    await writeClient.create(downloadData);

    // Increment download count
    await writeClient
      .patch(resourceId)
      .inc({ downloadCount: 1 })
      .commit();

    // Return download information
    return NextResponse.json({
      downloadUrl,
      downloadMethod,
      message: "Download tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking download:", error);
    
    // Still try to provide download URL even if tracking fails
    try {
      const resource = await client.fetch(
        `*[_type == "resource" && _id == $resourceId][0] {
          file,
          externalUrl
        }`,
        { resourceId }
      );

      if (resource?.file?.asset?.url) {
        return NextResponse.json({
          downloadUrl: resource.file.asset.url,
          downloadMethod: "direct",
          message: "Download available (tracking failed)",
        });
      } else if (resource?.externalUrl) {
        return NextResponse.json({
          downloadUrl: resource.externalUrl,
          downloadMethod: "external",
          message: "Download available (tracking failed)",
        });
      }
    } catch (fallbackError) {
      console.error("Fallback download error:", fallbackError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/resources/[resourceId]/download - Get download analytics (admin only)
export async function GET(
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

    // Get resource to check ownership
    const resource = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "resource" && _id == $resourceId][0] {
          _id,
          title,
          author->{
            _id,
            userId
          }
        }`,
        { resourceId }
      );

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Check permissions - author or admin can view analytics
    const isAuthor = resource.author?.userId === session.id;
    const canViewAnalytics = session.user.role && 
      hasPermission(session.user.role, Permission.VIEW_ANALYTICS);

    if (!isAuthor && !canViewAnalytics) {
      return NextResponse.json(
        { error: "Insufficient permissions to view download analytics" },
        { status: 403 }
      );
    }

    // Get download analytics
    const downloads = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "resourceDownload" && resource._ref == $resourceId && successful == true] {
          _id,
          downloadedAt,
          downloadMethod,
          metadata,
          user->{
            _id,
            userId,
            role
          }
        } | order(downloadedAt desc)`,
        { resourceId }
      );

    // Calculate analytics
    const analytics = {
      totalDownloads: downloads.length,
      downloadsByMethod: downloads.reduce((acc: any, download: any) => {
        acc[download.downloadMethod] = (acc[download.downloadMethod] || 0) + 1;
        return acc;
      }, {}),
      downloadsByDevice: downloads.reduce((acc: any, download: any) => {
        const device = download.metadata?.device || "unknown";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {}),
      downloadsByDate: downloads.reduce((acc: any, download: any) => {
        const date = new Date(download.downloadedAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
      uniqueUsers: new Set(downloads.filter((d: any) => d.user).map((d: any) => d.user._id)).size,
      anonymousDownloads: downloads.filter((d: any) => !d.user).length,
    };

    return NextResponse.json({
      analytics,
      recentDownloads: downloads.slice(0, 10), // Last 10 downloads
    });
  } catch (error) {
    console.error("Error fetching download analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
function parseUserAgent(userAgent: string) {
  // Simple user agent parsing - in production, use a proper library
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) 
    ? (/iPad/.test(userAgent) ? "tablet" : "mobile")
    : "desktop";
  
  const browser = userAgent.includes("Chrome") ? "Chrome" :
                 userAgent.includes("Firefox") ? "Firefox" :
                 userAgent.includes("Safari") ? "Safari" :
                 userAgent.includes("Edge") ? "Edge" : "Unknown";
  
  const os = userAgent.includes("Windows") ? "Windows" :
            userAgent.includes("Mac") ? "macOS" :
            userAgent.includes("Linux") ? "Linux" :
            userAgent.includes("Android") ? "Android" :
            userAgent.includes("iOS") ? "iOS" : "Unknown";

  return { device, browser, os };
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
