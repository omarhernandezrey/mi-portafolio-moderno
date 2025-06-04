interface FloatingElement {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  opacity: number;
}

export const createFloatingElements = (count = 12): FloatingElement[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.1
  }));
}; 