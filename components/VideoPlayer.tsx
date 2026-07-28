'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
  title: string
}

export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [loaded, setLoaded] = useState(false)

  // Autoplay muted on mount + when the source becomes playable (browser policy
  // requires muted for programmatic autoplay). Retries on canplay for slow links.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    const tryPlay = () => { v.play().then(() => setPlaying(true)).catch(() => {}) }
    tryPlay()
    v.addEventListener('canplay', tryPlay)
    return () => v.removeEventListener('canplay', tryPlay)
  }, [src])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePlay() }
    if (e.key === 'm') toggleMute()
  }, [togglePlay, toggleMute])

  return (
    <div
      className="relative w-full overflow-hidden rounded-20 bg-black select-none aspect-9-16"
      role="region"
      aria-label={`Video: ${title}`}
    >
      {/* Loading shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-bg-200 animate-shimmer" aria-hidden="true" />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        playsInline
        loop
        muted={muted}
        preload="auto"
        className="w-full h-full object-cover"
        aria-label={title}
        onLoadedMetadata={() => setLoaded(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Controls overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            onKeyDown={handleKeyDown}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="w-11 h-11 rounded-full glass-card flex items-center justify-center transition-transform active:scale-95"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            {playing
              ? <Pause className="w-5 h-5" aria-hidden="true" />
              : <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
            }
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="w-11 h-11 rounded-full glass-card flex items-center justify-center transition-transform active:scale-95"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            {muted
              ? <VolumeX className="w-5 h-5" aria-hidden="true" />
              : <Volume2 className="w-5 h-5" aria-hidden="true" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
