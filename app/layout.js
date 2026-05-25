import './globals.css';

export const metadata = {
  title: '0827RL231073',
  description: 'Bajaj Finserv Health Dev Challenge',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
