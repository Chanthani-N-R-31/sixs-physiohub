import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';