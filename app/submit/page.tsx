'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, Loader2, Lightbulb } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { pageVariants, pageTransition, fadeUpItem } from '@/lib/motion'

export default function SubmitPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-16">
        <motion.div
          variants={pageVariants}
          initial="initial" animate="animate" exit="exit"
          transition={pageTransition}
          className="max-w-2xl mx-auto px-4 sm:px-6 py-16"
        >
          <motion.div variants={fadeUpItem} className="mb-10 text-center">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <Lightbulb className="w-7 h-7 text-accent" aria-hidden="true" />
            </div>
            <h1 className="text-title mb-3">Submit a Business Idea</h1>
            <p className="text-muted">Have an idea worth a reel? Send it in. If we feature it, we will build a roadmap and setup guide around it.</p>
          </motion.div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-semibold mb-2">Idea received</h2>
              <p className="text-muted">Thanks for the submission. We review every idea and will reach out if we turn it into a reel.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5" noValidate>
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">Idea title <span className="text-accent">*</span></label>
                <input
                  id="title" type="text" required minLength={4}
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekend micro-fulfillment kiosk"
                  className="w-full px-4 py-3 rounded-14 border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">Describe it</label>
                <textarea
                  id="description" rows={5}
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is the idea, who is it for, and why now?"
                  className="w-full px-4 py-3 rounded-14 border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Your email <span className="text-muted font-normal">(optional — so we can credit you)</span></label>
                <input
                  id="email" type="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-14 border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={loading || title.trim().length < 4} className="btn-primary w-full">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Submitting…</>
                  : <><Send className="w-4 h-4" aria-hidden="true" /> Submit idea</>}
              </button>
            </form>
          )}
        </motion.div>
      </main>
      <Footer />
    </>
  )
}
