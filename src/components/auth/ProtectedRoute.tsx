import { SignedIn } from '@clerk/clerk-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <SignedIn>{children}</SignedIn>
} 