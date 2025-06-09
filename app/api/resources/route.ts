import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import {
  RESOURCES_QUERY,
  SEARCH_RESOURCES_QUERY,
  FEATURED_RESOURCES_QUERY,
  POPULAR_RESOURCES_QUERY,
  RECENT_RESOURCES_QUERY
} from "@/sanity/lib/resourceQueries";

// GET /api/resources - Get resources with filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const difficulty = searchParams.get("difficulty");
    const featured = searchParams.get("featured");
    const popular = searchParams.get("popular");
    const recent = searchParams.get("recent");
    const accessLevel = searchParams.get("accessLevel");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const session = await auth();
    let query = RESOURCES_QUERY;
    let params: any = {};

    // Handle different query types
    if (search) {
      query = SEARCH_RESOURCES_QUERY;
      params.searchTerm = search;
    } else if (featured === "true") {
      query = FEATURED_RESOURCES_QUERY;
    } else if (popular === "true") {
      query = POPULAR_RESOURCES_QUERY;
    } else if (recent === "true") {
      query = RECENT_RESOURCES_QUERY;
    } else if (category) {
      query = `*[_type == "resource" && status == "published" && (
        category._ref == $categoryId || 
        $categoryId in additionalCategories[]._ref
      )] | order(createdAt desc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        resourceType,
        thumbnailImage,
        category->{
          _id,
          name,
          slug,
          icon,
          color
        },
        tags,
        difficulty,
        price,
        downloadCount,
        rating,
        author->{
          _id,
          userId,
          role
        },
        createdAt
      }`;
      params.categoryId = category;
    } else if (type) {
      query = `*[_type == "resource" && status == "published" && resourceType == $resourceType] | order(createdAt desc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        resourceType,
        thumbnailImage,
        category->{
          _id,
          name,
          slug,
          icon,
          color
        },
        downloadCount,
        rating,
        author->{
          _id,
          userId,
          role
        }
      }`;
      params.resourceType = type;
    } else if (difficulty) {
      query = `*[_type == "resource" && status == "published" && difficulty == $difficulty] | order(createdAt desc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        resourceType,
        thumbnailImage,
        category->{
          _id,
          name,
          slug,
          icon,
          color
        },
        difficulty,
        downloadCount,
        rating,
        author->{
          _id,
          userId,
          role
        }
      }`;
      params.difficulty = difficulty;
    } else {
      // Default query with pagination
      query = `*[_type == "resource" && status == "published"] | order(createdAt desc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        resourceType,
        thumbnailImage,
        category->{
          _id,
          name,
          slug,
          icon,
          color
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
        featured,
        accessLevel,
        downloadCount,
        viewCount,
        rating,
        author->{
          _id,
          userId,
          role,
          company,
          position
        },
        createdAt,
        publishedAt
      }`;
    }

    let resources = await client.fetch(query, params);

    // Filter by access level based on user permissions
    if (!session) {
      // Anonymous users can only see public resources
      resources = resources.filter((resource: any) => resource.accessLevel === "public");
    } else {
      // Logged-in users can see public and community resources
      const userRole = session.user?.role || Role.USER;
      resources = resources.filter((resource: any) => {
        if (resource.accessLevel === "public") return true;
        if (resource.accessLevel === "community") return true;
        if (resource.accessLevel === "premium") {
          // Check if user has premium access (implement based on your business logic)
          return hasPermission(userRole, Permission.VIEW_ANALYTICS); // Example permission
        }
        if (resource.accessLevel === "restricted") {
          // Only admins can see restricted resources
          return hasPermission(userRole, Permission.ADMIN_SYSTEM);
        }
        return false;
      });
    }

    // Apply additional access level filter if specified
    if (accessLevel) {
      resources = resources.filter((resource: any) => resource.accessLevel === accessLevel);
    }

    // Get total count for pagination
    let totalQuery = `count(*[_type == "resource" && status == "published"])`;
    if (search) {
      totalQuery = `count(*[_type == "resource" && status == "published" && (
        title match $searchTerm + "*" ||
        description match $searchTerm + "*" ||
        $searchTerm in tags[] ||
        category->name match $searchTerm + "*"
      )])`;
    } else if (category) {
      totalQuery = `count(*[_type == "resource" && status == "published" && (
        category._ref == $categoryId || 
        $categoryId in additionalCategories[]._ref
      )])`;
    } else if (type) {
      totalQuery = `count(*[_type == "resource" && status == "published" && resourceType == $resourceType])`;
    } else if (difficulty) {
      totalQuery = `count(*[_type == "resource" && status == "published" && difficulty == $difficulty])`;
    }

    const total = await client.fetch(totalQuery, params);

    return NextResponse.json({
      resources,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to create resources
    if (!hasPermission(session.user.role || Role.USER, Permission.CREATE_RESOURCE)) {
      return NextResponse.json(
        { error: "Insufficient permissions to create resources" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Get user profile to use as author
    const userProfile = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "userProfile" && userId == $userId][0]`,
        { userId: session.id }
      );

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    const requiredFields = [
      'title', 'description', 'resourceType', 'category'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate that either file or externalUrl is provided
    if (!body.file && !body.externalUrl) {
      return NextResponse.json(
        { error: "Either file upload or external URL is required" },
        { status: 400 }
      );
    }

    // Create resource data
    const resourceData = {
      _type: "resource",
      title: body.title,
      slug: {
        _type: "slug",
        current: body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      },
      description: body.description,
      content: body.content || [],
      resourceType: body.resourceType,
      category: {
        _type: "reference",
        _ref: body.category,
      },
      additionalCategories: body.additionalCategories?.map((id: string) => ({
        _type: "reference",
        _ref: id,
      })) || [],
      tags: body.tags || [],
      file: body.file || null,
      externalUrl: body.externalUrl || null,
      thumbnailImage: body.thumbnailImage || null,
      author: {
        _type: "reference",
        _ref: userProfile._id,
      },
      contributors: body.contributors?.map((id: string) => ({
        _type: "reference",
        _ref: id,
      })) || [],
      difficulty: body.difficulty || "beginner",
      estimatedTime: body.estimatedTime || null,
      price: body.price || { isFree: true },
      requirements: body.requirements || [],
      featured: false, // Only admins can set featured
      status: "draft", // New resources start as draft
      accessLevel: body.accessLevel || "public",
      downloadCount: 0,
      viewCount: 0,
      rating: {
        average: 0,
        count: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newResource = await writeClient.create(resourceData);

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
