import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: 'Status | Omar Hernández Rey',
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
