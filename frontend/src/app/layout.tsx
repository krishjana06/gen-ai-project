import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CourseGraph - Cornell Course Visualizer',
  description: '3D interactive visualization of Cornell CS and Math courses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
