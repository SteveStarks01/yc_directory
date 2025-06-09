import { auth, currentUser } from '@clerk/nextjs/server'
import { Role, Permission, getUserPermissions } from '@/lib/permissions'
import { client } from '@/sanity/lib/client'
import { writeClient } from '@/sanity/lib/write-client'

// Extended user type that includes our custom fields
export interface ExtendedUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: Role
  permissions?: Permission[]
  username?: string | null
  bio?: string | null
}

// Get current user with extended information
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    const user = await currentUser()
    if (!user) return null

    // Get user profile from Sanity
    const userProfile = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "userProfile" && userId == $userId][0] {
          role,
          bio,
          isVerified,
          isActive
        }`,
        { userId: user.id }
      )

    const role = userProfile?.role || Role.USER
    const permissions = getUserPermissions(role)

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || null,
      image: user.imageUrl || null,
      role,
      permissions,
      username: user.username || null,
      bio: userProfile?.bio || null,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Get auth session with user info
export async function getAuthSession() {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const user = await getCurrentUser()
    if (!user) return null

    return {
      user,
      userId,
    }
  } catch (error) {
    console.error('Error getting auth session:', error)
    return null
  }
}

// Create or update user profile in Sanity when they sign up/in
export async function syncUserWithSanity(clerkUser: any) {
  try {
    const userId = clerkUser.id
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const name = clerkUser.firstName && clerkUser.lastName 
      ? `${clerkUser.firstName} ${clerkUser.lastName}` 
      : clerkUser.firstName || clerkUser.lastName || null
    const image = clerkUser.imageUrl
    const username = clerkUser.username

    // Check if user already exists in Sanity
    const existingUser = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "author" && id == $userId][0]`,
        { userId }
      )

    if (!existingUser) {
      // Create author record
      await writeClient.create({
        _type: "author",
        id: userId,
        name,
        username: username || email?.split('@')[0] || `user_${userId.slice(-8)}`,
        email,
        image,
        bio: "",
      })

      // Create user profile record for community features
      await writeClient.create({
        _type: "userProfile",
        userId: userId,
        role: Role.USER, // Default role for new users
        bio: "",
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isVerified: false,
        isActive: true,
        preferences: {
          emailNotifications: true,
          profileVisibility: "community",
          showEmail: false,
        },
      })
    } else {
      // Update existing user with latest info from Clerk
      await writeClient
        .patch(existingUser._id)
        .set({
          name,
          email,
          image,
          username: username || existingUser.username,
        })
        .commit()
    }

    return true
  } catch (error) {
    console.error('Error syncing user with Sanity:', error)
    return false
  }
}

// Helper function to check if user has permission
export async function hasUserPermission(permission: Permission): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.permissions) return false
    
    return user.permissions.includes(permission)
  } catch (error) {
    console.error('Error checking user permission:', error)
    return false
  }
}

// Helper function to check if user has role
export async function hasUserRole(role: Role): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false
    
    return user.role === role
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

// Helper function to require authentication
export async function requireAuth() {
  const session = await getAuthSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

// Helper function to require specific permission
export async function requirePermission(permission: Permission) {
  const session = await requireAuth()
  const hasPermission = await hasUserPermission(permission)
  
  if (!hasPermission) {
    throw new Error(`Permission '${permission}' required`)
  }
  
  return session
}

// Helper function to require specific role
export async function requireRole(role: Role) {
  const session = await requireAuth()
  const hasRole = await hasUserRole(role)
  
  if (!hasRole) {
    throw new Error(`Role '${role}' required`)
  }
  
  return session
}
