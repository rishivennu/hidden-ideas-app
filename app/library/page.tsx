import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LibraryClient from './LibraryClient'
import { IDEAS } from '@/lib/demoData'

export const metadata: Metadata = {
  title: 'Idea Library',
  description: 'Browse and filter hidden business ideas. Download the roadmaps you want.',
}

export default function LibraryPage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <header className="mb-8">
            <h1 className="text-title">Idea Library</h1>
            <p className="text-muted mt-1">{IDEAS.length} hidden business ideas. Filter, search, and grab the roadmaps you want.</p>
          </header>
          <LibraryClient ideas={IDEAS} />
        </div>
      </main>
      <Footer />
    </>
  )
}
