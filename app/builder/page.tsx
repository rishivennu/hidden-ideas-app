import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BuilderClient from './BuilderClient'

export const metadata: Metadata = {
  title: 'Roadmap Builder — biz',
  description: 'Turn any business idea into a detailed, editable step-by-step roadmap — from validation to launch to growth. Free, no sign-in, exports to PDF.',
}

export default function BuilderPage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-paper pt-24 pb-20">
        <BuilderClient />
      </main>
      <Footer />
    </>
  )
}
