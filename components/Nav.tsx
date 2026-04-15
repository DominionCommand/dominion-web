const links = [
  { href: '/', label: 'Home' },
  { href: '/status', label: 'Status' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/mission-control', label: 'Mission Control' },
  { href: '/command-center', label: 'Command Center' },
  { href: '/control-tower', label: 'Control Tower' },
  { href: '/release-room', label: 'Release Room' },
  { href: '/briefing', label: 'Briefing' },
  { href: '/activity', label: 'Activity' },
  { href: '/war-room', label: 'War Room' },
  { href: '/prototype', label: 'Prototype' },
  { href: '/launch-plan', label: 'Launch Plan' },
  { href: '/storefront', label: 'Storefront' },
  { href: '/signals', label: 'Signals' },
  { href: '/recruitment', label: 'Recruitment' },
  { href: '/cohorts', label: 'Cohorts' },
  { href: '/founder-pipeline', label: 'Founder Pipeline' },
  { href: '/strike-team', label: 'Strike Team' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/factions', label: 'Factions' },
  { href: '/commanders', label: 'Commanders' },
  { href: '/alliances', label: 'Alliances' },
  { href: '/world', label: 'World' },
  { href: '/nexus', label: 'Nexus' },
  { href: '/preregister', label: 'Preregister' },
  { href: '/intel', label: 'Intel' },
  { href: '/ops', label: 'Ops' },
  { href: '/about', label: 'About' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/contact', label: 'Contact' },
  { href: '/contact-queue', label: 'Contact Queue' },
  { href: '/playtest', label: 'Playtest' },
  { href: '/news', label: 'News' },
  { href: '/media', label: 'Media' },
  { href: '/public-kit', label: 'Public Kit' },
  { href: '/events', label: 'Events' },
  { href: '/faq', label: 'FAQ' },
  { href: '/press', label: 'Press' },
  { href: '/routes', label: 'Routes' },
];

export function Nav() {
  return (
    <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <a href="/" style={{ fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Dominion Nexus
        </a>
        <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {links.map((link) => (
            <a key={link.href} href={link.href} style={{ color: '#d1d5db' }}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
