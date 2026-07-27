import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-32 text-center">
          <p className="text-accent font-semibold mb-3">404</p>
          <h1 className="text-title mb-4">Page not found</h1>
          <p className="text-muted mb-8">The page you are looking for does not exist or has moved.</p>
          <Link href="/" className="btn-primary">Back to home</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
