import type { Metadata } from 'next'
import { Suspense } from 'react'
import AuthPageClient from '@/components/AuthPageClient'

export const metadata: Metadata = { title: 'Sign up — biz' }

export default function SignupPage() {
  return (
    <Suspense>
      <AuthPageClient mode="signup" />
    </Suspense>
  )
}
