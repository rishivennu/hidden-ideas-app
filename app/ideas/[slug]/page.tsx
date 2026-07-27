import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import IdeaDetailClient from './IdeaDetailClient'
import { getIdea, IDEAS } from '@/lib/demoData'

interface PageProps { params: { slug: string } }

export function generateStaticParams() {
  return IDEAS.map((i) => ({ slug: i.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const idea = getIdea(params.slug)
  if (!idea) return { title: 'Idea not found' }
  return { title: idea.title, description: idea.tagline }
}

export default function IdeaPage({ params }: PageProps) {
  const idea = getIdea(params.slug)
  if (!idea) notFound()
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-28">
        <IdeaDetailClient idea={idea} />
      </main>
      <Footer />
    </>
  )
}
