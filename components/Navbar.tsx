import Link from "next/link";
import Image from "next/image";
import { BadgePlus, BarChart3 } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/clerk-auth";
import { Role, hasPermission, Permission } from "@/lib/permissions";

const Navbar = async () => {
  // Get current user from Clerk
  const user = await getCurrentUser();

  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={144} height={30} />
        </Link>

        <div className="flex items-center gap-5 text-black">
          <SignedIn>
            <Link href="/dashboard" className="hover:text-gray-600 transition-colors">
              <span className="max-sm:hidden">Dashboard</span>
            </Link>

            <Link href="/investors" className="hover:text-gray-600 transition-colors">
              <span className="max-sm:hidden">Investors</span>
            </Link>

            {user && hasPermission(user.role || Role.USER, Permission.VIEW_ANALYTICS) && (
              <Link href="/analytics" className="hover:text-gray-600 transition-colors">
                <span className="max-sm:hidden">Analytics</span>
                <BarChart3 className="size-6 sm:hidden" />
              </Link>
            )}

            <Link href="/startup/create">
              <span className="max-sm:hidden">Create</span>
              <BadgePlus className="size-6 sm:hidden" />
            </Link>

            {/* Clerk UserButton handles user menu, logout, etc. */}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Login
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
