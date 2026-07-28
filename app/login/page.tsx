import type { Metadata } from 'next'
import { Suspense } from 'react'
import AuthPageClient from '@/components/AuthPageClient'

export const metadata: Metadata = { title: 'Sign in — biz' }

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPageClient mode="login" />
    </Suspense>
  )
}
