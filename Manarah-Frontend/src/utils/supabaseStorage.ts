/**
 * Supabase Storage Client-to-Storage Direct Uploader
 * سبرنت 1: رفع الفيديو التعريفي مباشرة إلى Supabase Storage (حاوية videos)
 * يتجاوز قيود Vercel (4.5MB) ويدعم ملفات حتى 50MB مع متابعة نسبة التقدم (Progress).
 */

const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://fkgyihcgkbumqanvmqvg.supabase.co'

const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_CEDLEvzdReu24wvI6cjJNQ_SIfzL3xN'

const BUCKET_NAME = 'videos'

export interface UploadProgressCallback {
  (percentage: number): void
}

/**
 * رفع ملف فيديو مباشرة من المتصفح إلى حاوية videos في Supabase
 */
export async function uploadVideoToSupabase(
  file: File,
  userId?: number | string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const cleanExt = ['mp4', 'webm', 'mov'].includes(ext) ? ext : 'mp4'
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const uniqueName = `video_cv_${userId || 'grad'}_${timestamp}_${randomSuffix}.${cleanExt}`
  const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${uniqueName}`

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', targetUrl)
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY)
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
    xhr.setRequestHeader('x-upsert', 'true')

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // إنشاء الرابط العام المباشر لاستعراض وتشغيل الفيديو
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${uniqueName}`
        resolve(publicUrl)
      } else {
        try {
          const errData = JSON.parse(xhr.responseText)
          reject(new Error(errData.message || errData.error || `فشل الرفع: رمز ${xhr.status}`))
        } catch {
          reject(new Error(`فشل رفع الفيديو إلى التخزين السحابي (رمز الخطأ: ${xhr.status})`))
        }
      }
    }

    xhr.onerror = () => {
      reject(new Error('انقطع الاتصال أثناء رفع الفيديو إلى السحابة. يرجى التحقق من اتصالك بالإنترنت.'))
    }

    xhr.send(file)
  })
}
