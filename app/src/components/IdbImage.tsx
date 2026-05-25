import { useEffect, useState, forwardRef } from 'react';
import { resolveIdb, isIdb } from '@/lib/imageDb';

interface IdbImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
}

/**
 * Drop-in replacement for <img> that transparently resolves `idb://` references
 * stored in IndexedDB, while passing plain URLs straight through.
 */
export const IdbImage = forwardRef<HTMLImageElement, IdbImageProps>(
  ({ src, fallback, onError, ...props }, ref) => {
    const [resolved, setResolved] = useState<string>(() =>
      isIdb(src) ? (fallback ?? '') : src
    );
    const [objUrl, setObjUrl] = useState<string | null>(null);

    useEffect(() => {
      if (!isIdb(src)) {
        setResolved(src);
        return;
      }
      let cancelled = false;
      resolveIdb(src).then((url) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (url) {
          setObjUrl(url);
          setResolved(url);
        } else {
          setResolved(fallback ?? '');
        }
      });
      return () => {
        cancelled = true;
        if (objUrl) URL.revokeObjectURL(objUrl);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    if (!resolved) return null;

    return (
      <img
        ref={ref}
        src={resolved}
        draggable={false}
        onError={onError}
        {...props}
      />
    );
  }
);

IdbImage.displayName = 'IdbImage';
