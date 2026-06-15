export const metadata = {
  title: 'Diário de Dieta',
  description: 'Controle alimentar — Eduardo',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif", background: '#F7F6F3' }}>
        {children}
      </body>
    </html>
  )
}
