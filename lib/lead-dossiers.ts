import { readActivityLog, type ActivityRecord } from './activity-log';
import { buildContactRequestId, readContactQueueDecisions } from './contact-queue';
import { readContactRequests } from './contact-intake';
import { explainLeadScore, scoreLead } from './funnel';
import { readFounderPipelineState, type FounderPipelineEntry } from './founder-pipeline';
import { readInviteQueueState, type InviteDecision } from './invite-queue';
import { readLeads } from './leads';
import { decodeLeadEmail, normalizeLeadEmail } from './lead-routes';
import { getWaveLabel } from './waves';

export type LeadDossier = {
  generatedAt: string;
  email: string;
  headline: string;
  summary: {
    leadCaptured: boolean;
    invitePriority: 'priority' | 'standard' | 'watchlist' | 'unknown';
    contactRequests: number;
    openContactRequests: number;
    latestTouchAt: string | null;
  };
  leadProfile: (ReturnType<typeof scoreLead> & {
    scoreReasons: string[];
    recommendedWaveLabel: string;
  }) | null;
  founderPipeline: FounderPipelineEntry | null;
  inviteQueue: (InviteDecision & { waveLabel: string }) | null;
  contactHistory: Array<{
    requestId: string;
    name?: string;
    topic: 'founder-access' | 'partnership' | 'press' | 'support';
    message: string;
    ts: string;
    status: 'new' | 'triaged' | 'in-progress' | 'waiting' | 'closed';
    priority: 'critical' | 'high' | 'normal';
    owner: string;
    note: string;
    updatedAt: string;
  }>;
  recentActivity: ActivityRecord[];
  timeline: Array<{
    ts: string;
    type: 'lead' | 'founder-pipeline' | 'invite-queue' | 'contact' | 'activity';
    title: string;
    detail: string;
  }>;
  recommendedActions: string[];
};

function matchesActivityEmail(entry: ActivityRecord, email: string) {
  const metadataEmail = entry.metadata?.email?.trim().toLowerCase();
  const metadataRequestId = entry.metadata?.requestId?.trim().toLowerCase() ?? '';
  const haystack = `${entry.summary} ${entry.detail ?? ''}`.toLowerCase();

  return metadataEmail === email || metadataRequestId.includes(email) || haystack.includes(email);
}

export async function buildLeadDossier(rawEmail: string): Promise<LeadDossier | null> {
  const email = decodeLeadEmail(rawEmail);

  if (!email || !email.includes('@')) {
    return null;
  }

  const [leads, founderPipelineState, inviteQueueState, contactRequests, contactDecisions, activity] = await Promise.all([
    readLeads(),
    readFounderPipelineState(),
    readInviteQueueState(),
    readContactRequests(),
    readContactQueueDecisions(),
    readActivityLog(200),
  ]);

  const lead = leads.find((entry) => normalizeLeadEmail(entry.email) === email) ?? null;
  const scoredLead = lead
    ? {
        ...scoreLead(lead),
        scoreReasons: explainLeadScore(lead),
        recommendedWaveLabel: getWaveLabel(scoreLead(lead).wave),
      }
    : null;
  const founderPipeline = founderPipelineState.entries.find((entry) => normalizeLeadEmail(entry.email) === email) ?? null;
  const inviteQueueDecision = inviteQueueState.decisions.find((entry) => normalizeLeadEmail(entry.email) === email) ?? null;

  const decisionByRequestId = new Map<string, Awaited<ReturnType<typeof readContactQueueDecisions>>[number]>();
  contactDecisions.forEach((decision) => {
    if (!decisionByRequestId.has(decision.requestId)) {
      decisionByRequestId.set(decision.requestId, decision);
    }
  });

  const contactHistory = contactRequests
    .filter((entry) => normalizeLeadEmail(entry.email) === email)
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .map((entry) => {
      const requestId = buildContactRequestId(entry);
      const decision = decisionByRequestId.get(requestId);
      const defaultPriority = entry.topic === 'support' ? 'normal' : 'high';

      return {
        requestId,
        name: entry.name,
        topic: entry.topic,
        message: entry.message,
        ts: entry.ts,
        status: decision?.status ?? 'new',
        priority: decision?.priority ?? defaultPriority,
        owner: decision?.owner ?? '',
        note: decision?.note ?? '',
        updatedAt: decision?.updatedAt ?? entry.ts,
      };
    });

  const recentActivity = activity.filter((entry) => matchesActivityEmail(entry, email)).slice(0, 10);

  if (!lead && !founderPipeline && !inviteQueueDecision && !contactHistory.length && !recentActivity.length) {
    return null;
  }

  const timeline = [
    lead
      ? {
          ts: lead.ts,
          type: 'lead' as const,
          title: 'Lead captured',
          detail: `${lead.source} captured this lead profile.`,
        }
      : null,
    founderPipeline
      ? {
          ts: founderPipeline.updatedAt,
          type: 'founder-pipeline' as const,
          title: `Founder pipeline moved to ${founderPipeline.stage}`,
          detail: `${founderPipeline.owner} is handling this through ${founderPipeline.channel}.${founderPipeline.note ? ` ${founderPipeline.note}` : ''}`,
        }
      : null,
    inviteQueueDecision
      ? {
          ts: inviteQueueDecision.updatedAt,
          type: 'invite-queue' as const,
          title: `Invite queue marked ${inviteQueueDecision.status}`,
          detail: `${getWaveLabel(inviteQueueDecision.wave)}.${inviteQueueDecision.note ? ` ${inviteQueueDecision.note}` : ''}`,
        }
      : null,
    ...contactHistory.map((entry) => ({
      ts: entry.updatedAt,
      type: 'contact' as const,
      title: `${entry.topic} request is ${entry.status}`,
      detail: entry.note || entry.message,
    })),
    ...recentActivity.map((entry) => ({
      ts: entry.ts,
      type: 'activity' as const,
      title: entry.summary,
      detail: entry.detail || entry.action,
    })),
  ]
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 16);

  const latestTouchAt = timeline[0]?.ts ?? null;
  const recommendedActions: string[] = [];

  if (scoredLead?.invitePriority === 'priority' && !inviteQueueDecision) {
    recommendedActions.push(`Add ${email} to the invite queue now. This lead already scores as priority.`);
  }

  if (scoredLead?.invitePriority !== 'watchlist' && founderPipeline?.stage === 'qualified' && inviteQueueDecision?.status !== 'sent') {
    recommendedActions.push(`Move ${email} from qualified follow-up into an active invite send lane.`);
  }

  if (inviteQueueDecision?.status === 'hold') {
    recommendedActions.push(`Review the hold note for ${email} and decide whether to unblock or archive the lead.`);
  }

  if (contactHistory.some((entry) => entry.status !== 'closed' && !entry.owner)) {
    recommendedActions.push(`Assign an owner to the open inbound thread for ${email} so it does not stall.`);
  }

  if (contactHistory.some((entry) => entry.status === 'waiting')) {
    recommendedActions.push(`There is a waiting contact thread for ${email}. Close the loop or send the next-step response.`);
  }

  if (!recommendedActions.length) {
    recommendedActions.push(`No immediate blocker is visible for ${email}. Keep the dossier warm as new operator activity lands.`);
  }

  const headline = scoredLead
    ? `${scoredLead.recommendedWaveLabel} is the current best-fit wave for ${email}, with ${contactHistory.length} linked inbound touchpoint${contactHistory.length === 1 ? '' : 's'} across intake.`
    : `${email} has an intake footprint across Dominion Nexus, even without a saved prereg profile yet.`;

  return {
    generatedAt: new Date().toISOString(),
    email,
    headline,
    summary: {
      leadCaptured: Boolean(lead),
      invitePriority: scoredLead?.invitePriority ?? 'unknown',
      contactRequests: contactHistory.length,
      openContactRequests: contactHistory.filter((entry) => entry.status !== 'closed').length,
      latestTouchAt,
    },
    leadProfile: scoredLead,
    founderPipeline,
    inviteQueue: inviteQueueDecision
      ? {
          ...inviteQueueDecision,
          waveLabel: getWaveLabel(inviteQueueDecision.wave),
        }
      : null,
    contactHistory,
    recentActivity,
    timeline,
    recommendedActions,
  };
}
