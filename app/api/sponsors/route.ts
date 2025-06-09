import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";

// GET /api/sponsors - Get sponsors
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'active';
    const tier = searchParams.get('tier');
    const industry = searchParams.get('industry');
    const publicOnly = searchParams.get('public') === 'true';

    // Build query filters
    let filters = [`status == "${status}"`];
    
    if (tier) {
      filters.push(`sponsorshipTier == "${tier}"`);
    }
    
    if (industry) {
      filters.push(`industry == "${industry}"`);
    }

    const filterString = filters.length > 0 ? ` && ${filters.join(' && ')}` : '';

    // Determine what fields to return based on permissions
    let fieldsToReturn = `
      _id,
      companyName,
      slug,
      logo,
      website,
      description,
      industry,
      sponsorshipTier,
      sponsorshipTypes,
      status,
      createdAt
    `;

    // If user has admin permissions or is authenticated, return more details
    if (session?.user?.id && !publicOnly) {
      const userRole = session.user.role || Role.USER;
      if (hasPermission(userRole, Permission.VIEW_ANALYTICS)) {
        fieldsToReturn = `
          _id,
          companyName,
          slug,
          logo,
          website,
          description,
          primaryContact,
          industry,
          companySize,
          location,
          foundedYear,
          sponsorshipTier,
          sponsorshipTypes,
          sponsorshipGoals,
          contractDetails,
          benefits,
          kpis,
          status,
          accountManager->{
            _id,
            userId,
            role
          },
          satisfactionScore,
          renewalProbability,
          createdAt,
          updatedAt
        `;
      }
    }

    // Get sponsors
    const sponsors = await client.fetch(
      `*[_type == "sponsor"${filterString}] | order(sponsorshipTier asc, contractDetails.monthlyAmount desc) [$offset...$limit] {
        ${fieldsToReturn}
      }`,
      { offset, limit: offset + limit }
    );

    // Get total count for pagination
    const total = await client.fetch(
      `count(*[_type == "sponsor"${filterString}])`
    );

    return NextResponse.json({
      sponsors,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + sponsors.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/sponsors - Create a new sponsor
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can create sponsors
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.ADMIN_SYSTEM)) {
      return NextResponse.json(
        { error: 'Admin permissions required to create sponsors' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.companyName || !body.primaryContact || !body.sponsorshipTier) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, primaryContact, sponsorshipTier' },
        { status: 400 }
      );
    }

    // Get account manager profile if specified
    let accountManager = null;
    if (body.accountManager) {
      accountManager = await client.fetch(
        `*[_type == "userProfile" && userId == $userId][0]._id`,
        { userId: body.accountManager }
      );
    }

    // Create sponsor data
    const sponsorData = {
      _type: 'sponsor',
      companyName: body.companyName,
      slug: {
        _type: 'slug',
        current: body.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      },
      logo: body.logo,
      website: body.website,
      description: body.description,
      primaryContact: body.primaryContact,
      billingContact: body.billingContact,
      industry: body.industry,
      companySize: body.companySize,
      location: body.location,
      foundedYear: body.foundedYear,
      sponsorshipTier: body.sponsorshipTier,
      sponsorshipTypes: body.sponsorshipTypes || [],
      sponsorshipGoals: body.sponsorshipGoals || [],
      contractDetails: body.contractDetails,
      benefits: body.benefits || [],
      customBenefits: body.customBenefits,
      kpis: body.kpis || [],
      status: body.status || 'pending',
      accountManager: accountManager ? {
        _type: 'reference',
        _ref: accountManager,
      } : null,
      satisfactionScore: body.satisfactionScore,
      renewalProbability: body.renewalProbability,
      notes: body.notes,
      communicationLog: body.communicationLog || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create sponsor
    const sponsor = await writeClient.create(sponsorData);

    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/sponsors - Update sponsor
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can update sponsors
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.ADMIN_SYSTEM)) {
      return NextResponse.json(
        { error: 'Admin permissions required to update sponsors' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sponsorId, ...updates } = body;

    if (!sponsorId) {
      return NextResponse.json(
        { error: 'Missing required field: sponsorId' },
        { status: 400 }
      );
    }

    // Get existing sponsor
    const existingSponsor = await client.fetch(
      `*[_type == "sponsor" && _id == $sponsorId][0]._id`,
      { sponsorId }
    );

    if (!existingSponsor) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    // Handle account manager update
    if (updates.accountManager) {
      const accountManager = await client.fetch(
        `*[_type == "userProfile" && userId == $userId][0]._id`,
        { userId: updates.accountManager }
      );
      
      if (accountManager) {
        updates.accountManager = {
          _type: 'reference',
          _ref: accountManager,
        };
      } else {
        delete updates.accountManager;
      }
    }

    // Add updated timestamp
    updates.updatedAt = new Date().toISOString();

    // Update sponsor
    const updatedSponsor = await writeClient
      .patch(sponsorId)
      .set(updates)
      .commit();

    return NextResponse.json(updatedSponsor);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/sponsors - Delete sponsor
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const sponsorId = searchParams.get('sponsorId');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!sponsorId) {
      return NextResponse.json(
        { error: 'Missing required parameter: sponsorId' },
        { status: 400 }
      );
    }

    // Check if user can delete sponsors
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.ADMIN_SYSTEM)) {
      return NextResponse.json(
        { error: 'Admin permissions required to delete sponsors' },
        { status: 403 }
      );
    }

    // Check if sponsor exists
    const existingSponsor = await client.fetch(
      `*[_type == "sponsor" && _id == $sponsorId][0]._id`,
      { sponsorId }
    );

    if (!existingSponsor) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    // Check if sponsor has active sponsorships
    const activeSponsorships = await client.fetch(
      `count(*[_type == "sponsorship" && sponsor._ref == $sponsorId && status in ["active", "approved"]])`,
      { sponsorId }
    );

    if (activeSponsorships > 0) {
      return NextResponse.json(
        { error: 'Cannot delete sponsor with active sponsorships. Please cancel sponsorships first.' },
        { status: 400 }
      );
    }

    // Soft delete by updating status
    await writeClient
      .patch(sponsorId)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json(
      { message: 'Sponsor deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
