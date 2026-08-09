// La metadata de /recursos vive en page.tsx; duplicarla aquí competía con ella.
export default function RecursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
