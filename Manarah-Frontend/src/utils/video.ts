/**
 * Video Helper Utilities
 * سبرنت 1: معالجة روابط وتضمين الفيديو التعريفي (Video CV)
 * يدعم البث الداخلي والملفات المباشرة ومنصات الفيديو السحابية:
 * Google Drive, YouTube, Loom, Vimeo
 */

export interface VideoEmbedInfo {
  type: 'iframe' | 'native'
  src: string
}

export function getVideoSourceUrl(url?: string | null): string {
  if (!url) return ''
  // External URLs (e.g. YouTube, Google Drive, direct HTTPS CDNs) do not need platform internal token
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's an absolute URL pointing to our own domain API stream, it might still need token
    if (!url.includes('/api/profiles/graduate/video/stream/')) {
      return url
    }
  }

  const token =
    (typeof localStorage !== 'undefined' ? localStorage.getItem('manarah_token') : null) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('manarah_token') : null)

  if (!token || url.includes('token=')) return url
  const cleanToken = token.replace(/^(Token|Bearer)\s+/, '').trim()
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}token=${cleanToken}`
}

export function getEmbedVideoInfo(rawUrl?: string | null): VideoEmbedInfo | null {
  if (!rawUrl || !rawUrl.trim()) return null
  const u = rawUrl.trim()

  // 1. YouTube (watch, shorts, embed, youtu.be)
  const ytMatch = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.exec(u)
  if (ytMatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    }
  }

  // 2. Google Drive (file/d/, open?id=, docs.google.com/file/d/)
  const gdMatch = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/.exec(u)
  if (gdMatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://drive.google.com/file/d/${gdMatch[1]}/preview`,
    }
  }

  // 3. Loom (share, embed)
  const loomMatch = /loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/.exec(u)
  if (loomMatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://www.loom.com/embed/${loomMatch[1]}`,
    }
  }

  // 4. Vimeo (vimeo.com/id or player.vimeo.com/video/id)
  const vimeoMatch = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/.exec(u)
  if (vimeoMatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  // 5. Default: Native video player (platform stream or direct video file)
  return {
    type: 'native',
    src: getVideoSourceUrl(u),
  }
}
