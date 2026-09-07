"use client"

import { useRef, useState, useCallback, useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, AlertTriangle } from 'lucide-react'
import { isInstagramUrl, toEmbedUrl, isYouTubeUrl, toYouTubeEmbed } from '@/lib/mediaUrl'

interface VideoPlayerProps {
  src: string
  poster?: string
  title: string
}

/** Instagram-embed variant of the player — used on the reel detail page. */
function InstagramEmbed({ src, title }: { src: string; title: string }) {
  const embedUrl = toEmbedUrl(src)
  if (!embedUrl) return null
  return (
    <div
      className="relative w-full overflow-hidden rounded-20 bg-black select-none aspect-9-16"
      role="region"
      aria-label={`Video: ${title}`}
    >
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        title={title}
        aria-label={title}
      />
    </div>
  )
}

/** YouTube-embed variant — autoplays (muted) and loops inline, no download needed. */
function YouTubeEmbed({ src, title }: { src: string; title: string }) {
  const embedUrl = toYouTubeEmbed(src)
  if (!embedUrl) return null
  return (
    <div
      className="relative w-full overflow-hidden rounded-20 bg-black select-none aspect-9-16"
      role="region"
      aria-label={`Video: ${title}`}
    >
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        loading="lazy"
        title={title}
        aria-label={title}
      />
    </div>
  )
}

/** Direct-mp4 variant of the player — autoplays on scroll, supports manual pause, error state. */
function Mp4Player({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const userPausedRef = useRef(false)
  const reduceMotion = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const wrap = wrapRef.current
    if (!video || !wrap) return

    video.muted = true
    userPausedRef.current = false

    if (video.error) { setLoaded(true); setFailed(true) }
    else { setFailed(false); if (video.readyState >= 1) setLoaded(true) }

    const play = () => {
      if (reduceMotion || userPausedRef.current || document.hidden) return
      video.play().then(() => setPlaying(true)).catch(() => {})
    }

    let visible = true
    if (typeof IntersectionObserver !== 'undefined') {
      visible = false
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visible = entry.isIntersecting
            if (visible) play()
            else if (!video.paused) video.pause()
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(wrap)
      const onCanPlay = () => { if (visible) play() }
      const onVisibility = () => { if (document.hidden) video.pause(); else onCanPlay() }
      video.addEventListener('canplay', onCanPlay)
      document.addEventListener('visibilitychange', onVisibility)
      return () => {
        observer.disconnect()
        video.removeEventListener('canplay', onCanPlay)
        document.removeEventListener('visibilitychange', onVisibility)
        video.pause()
      }
    }

    play()
    const onCanPlay = () => play()
    video.addEventListener('canplay', onCanPlay)
    return () => { video.removeEventListener('canplay', onCanPlay); video.pause() }
  }, [src, reduceMotion])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { userPausedRef.current = false; v.play().then(() => setPlaying(true)).catch(() => {}) }
    else { userPausedRef.current = true; v.pause(); setPlaying(false) }
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted; setMuted(v.muted)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePlay() }
    if (e.key === 'm') toggleMute()
  }, [togglePlay, toggleMute])

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-20 bg-black select-none aspect-9-16"
      role="region"
      aria-label={`Video: ${title}`}
      data-playing={playing ? 'true' : 'false'}
    >
      {!loaded && !failed && (
        <div className="absolute inset-0 bg-bg-200 animate-shimmer" aria-hidden="true" />
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center bg-bg-200 p-6 text-center" role="alert">
          <div>
            <AlertTriangle className="w-7 h-7 mx-auto text-ink" aria-hidden="true" />
            <p className="font-display font-semibold mt-2">This video would not load</p>
            <p className="text-sm text-muted mt-1">The file may have moved, or its host is not allowed by the site&apos;s media policy.</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        muted={muted}
        preload="auto"
        className="w-full h-full object-cover"
        aria-label={title}
        onLoadedMetadata={() => { setLoaded(true); setFailed(false) }}
        onError={() => { setLoaded(true); setFailed(true) }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <button onClick={togglePlay} onKeyDown={handleKeyDown}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="w-11 h-11 rounded-full glass-card flex items-center justify-center transition-transform active:scale-95"
            style={{ minWidth: 44, minHeight: 44 }}>
            {playing ? <Pause className="w-5 h-5" aria-hidden="true" /> : <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />}
          </button>
          <button onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="w-11 h-11 rounded-full glass-card flex items-center justify-center transition-transform active:scale-95"
            style={{ minWidth: 44, minHeight: 44 }}>
            {muted ? <VolumeX className="w-5 h-5" aria-hidden="true" /> : <Volume2 className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  if (isYouTubeUrl(src)) return <YouTubeEmbed src={src} title={title} />
  if (isInstagramUrl(src)) return <InstagramEmbed src={src} title={title} />
  return <Mp4Player src={src} poster={poster} title={title} />
}
