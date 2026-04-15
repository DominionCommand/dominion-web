import { notFound } from 'next/navigation';

import { CardGrid } from '../../../components/CardGrid';
import { PageHero } from '../../../components/PageHero';
import { buildLeadDossier } from '../../../lib/lead-dossiers';

const topicLabels = {
  'founder-access': 'Founder access',
  partnership: 'Partnership',
  press: 'Press',
  support: 'Support',
} as const;

export default async function LeadDossierPage({ params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const dossier = await buildLeadDossier(email);

  if (!dossier) {
    notFound();
  }

  return (
    <main>
      <PageHero
        eyebrow="Lead dossier"
        title={dossier.email}
        body={dossier.headline}
      />

      <section className="section">
        <CardGrid>
          <article className="card">
            <div className="eyebrow">Lead profile</div>
            <h3>{dossier.leadProfile ? `Score ${dossier.leadProfile.score}` : 'Not captured'}</h3>
            <p>{dossier.leadProfile ? `${dossier.leadProfile.invitePriority} priority in ${dossier.leadProfile.recommendedWaveLabel}.` : 'No prereg or playtest profile is saved for this email yet.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Founder pipeline</div>
            <h3>{dossier.founderPipeline?.stage ?? 'Not staged'}</h3>
            <p>{dossier.founderPipeline ? `${dossier.founderPipeline.owner} via ${dossier.founderPipeline.channel}.` : 'No founder CRM record has been saved yet.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Invite queue</div>
            <h3>{dossier.inviteQueue?.status ?? 'Not queued'}</h3>
            <p>{dossier.inviteQueue ? `${dossier.inviteQueue.waveLabel} is the assigned wave.` : 'No invite decision is saved yet.'}</p>
          </article>
          <article className="card">
            <div className="eyebrow">Inbound history</div>
            <h3>{dossier.summary.contactRequests}</h3>
            <p>{dossier.summary.openContactRequests} open touchpoint{dossier.summary.openContactRequests === 1 ? '' : 's'} still need handling.</p>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Recommended actions</div>
        <h2>What to do next</h2>
        <CardGrid>
          {dossier.recommendedActions.map((action) => (
            <article className="card" key={action}>
              <p>{action}</p>
            </article>
          ))}
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Profile and operator state</div>
        <h2>Current lead posture</h2>
        <CardGrid>
          <article className="card">
            <h3>Lead profile</h3>
            {dossier.leadProfile ? (
              <>
                <p><strong>Faction:</strong> {dossier.leadProfile.factionLabel}</p>
                <p><strong>Platform:</strong> {dossier.leadProfile.platformLabel}</p>
                <p><strong>Play style:</strong> {dossier.leadProfile.playStyleLabel}</p>
                <p><strong>Source:</strong> {dossier.leadProfile.source}</p>
                <p><strong>Alliance role:</strong> {dossier.leadProfile.allianceRole || 'Unspecified'}</p>
                <p><strong>Weekly hours:</strong> {dossier.leadProfile.weeklyHours || 'Unspecified'}</p>
                <p><strong>Intent:</strong> {dossier.leadProfile.testIntent || 'Unspecified'}</p>
                <p><strong>Score signals:</strong> {dossier.leadProfile.scoreReasons.join(' · ')}</p>
              </>
            ) : (
              <p>No preregister or playtest profile is attached to this email yet.</p>
            )}
          </article>
          <article className="card">
            <h3>Founder pipeline</h3>
            {dossier.founderPipeline ? (
              <>
                <p><strong>Stage:</strong> {dossier.founderPipeline.stage}</p>
                <p><strong>Owner:</strong> {dossier.founderPipeline.owner}</p>
                <p><strong>Channel:</strong> {dossier.founderPipeline.channel}</p>
                <p><strong>Note:</strong> {dossier.founderPipeline.note || 'No founder note saved yet.'}</p>
                <p><strong>Updated:</strong> {new Date(dossier.founderPipeline.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </>
            ) : (
              <p>This lead has not been placed into the founder follow-up board yet.</p>
            )}
          </article>
          <article className="card">
            <h3>Invite queue</h3>
            {dossier.inviteQueue ? (
              <>
                <p><strong>Status:</strong> {dossier.inviteQueue.status}</p>
                <p><strong>Wave:</strong> {dossier.inviteQueue.waveLabel}</p>
                <p><strong>Note:</strong> {dossier.inviteQueue.note || 'No invite note saved yet.'}</p>
                <p><strong>Updated:</strong> {new Date(dossier.inviteQueue.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </>
            ) : (
              <p>No invite decision has been persisted for this lead yet.</p>
            )}
          </article>
          <article className="card">
            <h3>Related surfaces</h3>
            <p>Jump straight into the active operator boards for this lead.</p>
            <div className="ctaRow" style={{ marginTop: 12 }}>
              <a className="button buttonSecondary" href="/founder-pipeline">Founder pipeline</a>
              <a className="button buttonSecondary" href="/invite-queue">Invite queue</a>
              <a className="button buttonSecondary" href="/contact-queue">Contact queue</a>
            </div>
          </article>
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Contact history</div>
        <h2>Inbound linked to this email</h2>
        <CardGrid>
          {dossier.contactHistory.length ? dossier.contactHistory.map((entry) => (
            <article className="card" key={entry.requestId}>
              <div className="eyebrow">{topicLabels[entry.topic]} · {entry.status} · {entry.priority}</div>
              <h3>{entry.name || dossier.email}</h3>
              <p>{entry.message}</p>
              <p><strong>Owner:</strong> {entry.owner || 'Unassigned'}</p>
              <p><strong>Queue note:</strong> {entry.note || 'No queue note saved yet.'}</p>
              <p>{new Date(entry.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </article>
          )) : (
            <article className="card">
              <h3>No linked inbound yet</h3>
              <p>This email has not submitted a public contact request yet.</p>
            </article>
          )}
        </CardGrid>
      </section>

      <section className="section">
        <div className="eyebrow">Timeline</div>
        <h2>Recent trail across intake and ops</h2>
        <CardGrid>
          {dossier.timeline.map((entry, index) => (
            <article className="card" key={`${entry.type}-${entry.ts}-${index}`}>
              <div className="eyebrow">{entry.type}</div>
              <h3>{entry.title}</h3>
              <p>{entry.detail}</p>
              <p>{new Date(entry.ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </article>
          ))}
        </CardGrid>
      </section>
    </main>
  );
}
