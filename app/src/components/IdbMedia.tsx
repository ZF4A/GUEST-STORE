import { useEffect, useState } from 'react';
import { resolveIdb, isVideoSrc } from '@/lib/imageDb';

const needsResolve = (src: string) => src.startsWith('idb://') || src.startsWith('idbv://');

interface IdbMediaProps {
  src: string;
  alt?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  objectFit?: 'cover' | 'contain';
}

export function IdbMedia({
  src, alt, className,
  autoPlay = true, muted = true, loop = true, controls = false, playsInline = true,
}: IdbMediaProps) {
  const isVid = isVideoSrc(src);
  const [resolved, setResolved] = useState<string>(() => needsResolve(src) ? '' : src);
  const [objUrl, setObjUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!needsResolve(src)) { setResolved(src); return; }
    let cancelled = false;
    // idbv://uuid → resolve via idb://uuid (same store, different prefix)
    const idbRef = src.startsWith('idbv://') ? `idb://${src.slice(7)}` : src;
    resolveIdb(idbRef).then((url) => {
      if (cancelled) { if (url) URL.revokeObjectURL(url); return; }
      if (url) { setObjUrl(url); setResolved(url); }
    });
    return () => {
      cancelled = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!resolved) return null;

  if (isVid) {
    return (
      <video
        src={resolved}
        className={className}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        controls={controls}
        preload="metadata"
      />
    );
  }

  return <img src={resolved} alt={alt ?? ''} className={className} draggable={false} />;
}

export { isVideoSrc } from '@/lib/imageDb';
