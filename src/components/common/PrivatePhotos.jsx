import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import Skeleton from '../ui/Skeleton'
import { api } from '../../services/api'
import { QUERY_KEYS } from '../../constants'

/**
 * Photos a user sent as proof (with a report, a support ticket or a reply),
 * shown as thumbnails. Each lives in private storage, so it is fetched with
 * the admin's token from its `download_path`; clicking one opens it full size
 * in a new tab.
 */
export default function PrivatePhotos({ photos, label = 'Photos' }) {
  if (!photos?.length) return null

  return (
    <div>
      <span className="text-sm font-medium">
        {label} ({photos.length})
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <PrivatePhotoThumbnail key={photo.id} path={photo.download_path} number={index + 1} />
        ))}
      </div>
    </div>
  )
}

/** One private photo as a thumbnail; click for full size in a new tab. */
export function PrivatePhotoThumbnail({ path, number = 1 }) {
  const { data: blob, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.privatePhotos.photo(path),
    queryFn: () => api.get(path, { responseType: 'blob' }),
    staleTime: Infinity,
  })
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  useEffect(() => () => url && URL.revokeObjectURL(url), [url])

  if (isLoading) return <Skeleton className="size-24 rounded-md" />

  if (isError || !url) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-base-300 text-xs text-base-content/60 hover:bg-base-200"
        title="This photo could not be loaded. Click to try again."
      >
        <ImageOff className="size-5" />
        Retry
      </button>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block size-24 overflow-hidden rounded-md border border-base-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      aria-label={`Open photo ${number} full size`}
    >
      <img src={url} alt={`Photo ${number}`} className="size-full object-cover" />
    </a>
  )
}
