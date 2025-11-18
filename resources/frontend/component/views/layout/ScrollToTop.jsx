import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
   
    window.scrollTo(0, 0);

    const scrollableContainers = document.querySelectorAll('.overflow-y-auto');
    scrollableContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, [pathname]);

  return null;

}

export default ScrollToTop;