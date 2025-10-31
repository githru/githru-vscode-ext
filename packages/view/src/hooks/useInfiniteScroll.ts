import { useEffect, useRef, useState } from "react";

type UseInfiniteScrollOptions = {
  onIntersect: () => void;
  enabled?: boolean;
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
};

export const useInfiniteScroll = ({
  onIntersect,
  enabled = true,
  threshold = 0.1,
  rootMargin = "100px",
  root = null,
}: UseInfiniteScrollOptions) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        root,
        threshold,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onIntersect, threshold, rootMargin, root]);

  return { targetRef, isIntersecting };
};
