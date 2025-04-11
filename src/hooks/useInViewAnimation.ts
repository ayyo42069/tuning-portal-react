import { useInView } from 'react-intersection-observer';

interface UseInViewAnimationProps {
  threshold?: number;
  triggerOnce?: boolean;
}

export function useInViewAnimation({
  threshold = 0.1,
  triggerOnce = true,
}: UseInViewAnimationProps = {}) {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });

  return { ref, inView };
} 