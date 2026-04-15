const footerLinks = [
  { href: '/preregister', label: 'Preregister' },
  { href: '/news', label: 'News' },
  { href: '/media', label: 'Media' },
  { href: '/events', label: 'Events' },
  { href: '/prototype', label: 'Prototype' },
  { href: '/faq', label: 'FAQ' },
  { href: '/press', label: 'Press' },
  { href: '/ops', label: 'Ops' },
];

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>Dominion Nexus, live web and ops scaffold in progress.</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
