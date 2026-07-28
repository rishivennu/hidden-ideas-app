import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 prose-neutral">
          <h1 className="text-title mb-6">Privacy Policy</h1>
          <p className="text-muted mb-8">Last updated: {new Date().getFullYear()}</p>

          <section className="space-y-6 text-[15px] leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold mb-2">What we collect</h2>
              <p>We collect your email address when you create an account to download setup guides, and anonymous usage analytics to improve the product. We do not sell your data.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">How we use it</h2>
              <p>Your email is used solely to authenticate you and deliver the guides you request. Analytics are aggregated and never tied to your identity unless you consent.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Your rights</h2>
              <p>You can request deletion of your account and all associated data at any time by emailing us. We respond within 30 days.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Contact</h2>
              <p>Questions about privacy? Reach out at <a className="text-accent underline" href="mailto:privacy@hidden-ideas.app">privacy@hidden-ideas.app</a>.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
