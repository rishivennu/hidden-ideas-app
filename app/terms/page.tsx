import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-title mb-6">Terms of Service</h1>
          <p className="text-muted mb-8">Last updated: {new Date().getFullYear()}</p>

          <section className="space-y-6 text-[15px] leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold mb-2">Use of the service</h2>
              <p>Hidden Ideas provides business-idea reels, roadmaps, and downloadable setup guides for informational purposes. The content is not financial, legal, or investment advice.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Accounts</h2>
              <p>You are responsible for activity under your account. Do not share access or misuse downloaded materials.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Intellectual property</h2>
              <p>Guides and roadmaps are licensed for your personal use. You may not resell or redistribute them without written permission.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">No warranty</h2>
              <p>Results vary. We make no guarantee of income or business success from following any roadmap.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
