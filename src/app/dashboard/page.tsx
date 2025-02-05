import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignedIn, SignOutButton, UserButton } from '@clerk/nextjs';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/login');
  }

  return (
    <div className="min-w-screen min-h-screen bg-gray-100 text-gray-900">
      <SignedIn>
        <UserButton />
        <SignOutButton />
      </SignedIn>
    </div>
  );
}