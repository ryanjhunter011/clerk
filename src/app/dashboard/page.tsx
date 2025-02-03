import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { clerkClient } from "@clerk/nextjs/server";
import { SignOutButton } from '@clerk/nextjs';

async function UserInfo() {
  const client = await clerkClient()
  const users    = await client.users.getUserList();
  return users;
}
export default async function DashboardPage() {
  const { userId } = await auth();

  console.log(userId);

  if (!userId) {
    redirect('/auth/login');
  }

  const listUsers = await UserInfo();

  return (
    <div className="min-w-screen min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <SignOutButton />
    </div>
  );
}