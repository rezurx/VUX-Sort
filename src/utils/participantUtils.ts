import { ParticipantInvite, DemographicField } from '../types';

/**
 * Generate a unique participant invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate participant link with invite code
 */
export function generateParticipantLink(studyId: number, inviteCode: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/study/${studyId}/participate?code=${inviteCode}`;
}

/**
 * Validate invite code format
 */
export function isValidInviteCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code);
}

/**
 * Check if invite is expired
 */
export function isInviteExpired(invite: ParticipantInvite, expirationDays: number = 30): boolean {
  const invitedAt = new Date(invite.invitedAt);
  const expirationDate = new Date(invitedAt.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
  return new Date() > expirationDate;
}

/**
 * Parse CSV for bulk participant upload
 */
export function parseParticipantCSV(csvText: string): Array<Partial<ParticipantInvite>> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const participants: Array<Partial<ParticipantInvite>> = [];

  // Required field mappings
  const emailIndex = headers.findIndex(h => h.includes('email'));
  if (emailIndex === -1) {
    throw new Error('CSV must contain an email column');
  }

  const firstNameIndex = headers.findIndex(h => h.includes('first') && h.includes('name'));
  const lastNameIndex = headers.findIndex(h => h.includes('last') && h.includes('name'));

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} columns but header has ${headers.length}`);
      continue;
    }

    const email = values[emailIndex];
    if (!email || !isValidEmail(email)) {
      console.warn(`Row ${i + 1}: Invalid email "${email}"`);
      continue;
    }

    const participant: Partial<ParticipantInvite> = {
      email,
      firstName: firstNameIndex >= 0 ? values[firstNameIndex] : undefined,
      lastName: lastNameIndex >= 0 ? values[lastNameIndex] : undefined,
      customFields: {}
    };

    // Parse other columns as custom fields
    headers.forEach((header, index) => {
      if (index !== emailIndex && index !== firstNameIndex && index !== lastNameIndex) {
        const value = values[index];
        if (value && participant.customFields) {
          participant.customFields[header] = value;
        }
      }
    });

    participants.push(participant);
  }

  return participants;
}

/**
 * Generate CSV template for participant upload
 */
export function generateParticipantCSVTemplate(demographicFields: DemographicField[] = []): string {
  const baseHeaders = ['email', 'firstName', 'lastName'];
  const demographicHeaders = demographicFields.map(field => field.name.toLowerCase().replace(/\s+/g, '_'));
  const allHeaders = [...baseHeaders, ...demographicHeaders];
  
  const exampleRow = [
    'participant@example.com',
    'John',
    'Doe',
    ...demographicFields.map(field => {
      switch (field.type) {
        case 'number': return '25';
        case 'select': case 'radio': return field.options?.[0] || 'Option1';
        case 'checkbox': return 'true';
        case 'date': return '1990-01-01';
        default: return 'Sample Value';
      }
    })
  ];

  return [allHeaders.join(','), exampleRow.join(',')].join('\n');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create participant invites from parsed data
 */
export function createParticipantInvites(
  studyId: number,
  participantData: Array<Partial<ParticipantInvite>>
): ParticipantInvite[] {
  const now = new Date().toISOString();
  
  return participantData.map(data => ({
    id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    studyId,
    email: data.email!,
    firstName: data.firstName,
    lastName: data.lastName,
    demographics: data.customFields,
    inviteCode: generateInviteCode(),
    status: 'invited' as const,
    invitedAt: now,
    remindersSent: 0,
    customFields: data.customFields
  }));
}

/**
 * Find participant by invite code
 */
export function findParticipantByCode(invites: ParticipantInvite[], code: string): ParticipantInvite | null {
  return invites.find(invite => invite.inviteCode === code) || null;
}

/**
 * Generate participant statistics
 */
export interface ParticipantStats {
  total: number;
  invited: number;
  started: number;
  completed: number;
  expired: number;
  responseRate: number;
  completionRate: number;
}

export function calculateParticipantStats(invites: ParticipantInvite[], expirationDays: number = 30): ParticipantStats {
  const total = invites.length;
  const invited = invites.filter(i => i.status === 'invited').length;
  const started = invites.filter(i => i.status === 'started').length;
  const completed = invites.filter(i => i.status === 'completed').length;
  const expired = invites.filter(i => isInviteExpired(i, expirationDays)).length;
  
  const responseRate = total > 0 ? ((started + completed) / total) * 100 : 0;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    invited,
    started,
    completed,
    expired,
    responseRate,
    completionRate
  };
}