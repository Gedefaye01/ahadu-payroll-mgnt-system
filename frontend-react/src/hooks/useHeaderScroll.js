// src/hooks/useHeaderScroll.js
import { useEffect } from 'react';

export default function useHeaderScroll() {
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
