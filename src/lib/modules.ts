/**
 * Switchboard module catalog. Single source of truth for which modules
 * exist + which roles get them by default. Owners can override per-user
 * via tz_users.permissions on /switchboard/users.
 *
 * Resolution order at access-check time:
 *   1. If module is hard-locked (ownerOnly: true), require role === 'owner'.
 *      No override can grant it to a non-owner. (Used for /switchboard/users.)
 *   2. If user has an explicit permission key, that wins (true / false).
 *   3. Otherwise apply role default.
 */

import type { UserRole } from './users'

export type ModuleSlug =
  | 'lead-pipeline'
  | 'reports'
  | 'knowledge-base'
  | 'agent-training'
  | 'sms-conversations'
  | 'call-logs'
  | 'web-chat'
  | 'email-assistant'
  | 'employee-training'
  | 'office-operations'
  | 'warehouse-inventory'
  | 'sales-outbound'
  | 'users'

export type ModuleEntry = {
  slug: ModuleSlug
  label: string
  category: 'operations' | 'agents' | 'admin'
  /** When true, only owners can access; per-user overrides cannot grant it. */
  ownerOnly?: boolean
  /** Default-allowed roles when no per-user override is present. */
  defaultRoles: UserRole[]
}

export const MODULES: ModuleEntry[] = [
  // Operations
  {
    slug: 'lead-pipeline',
    label: 'Lead Pipeline',
    category: 'operations',
    defaultRoles: ['owner', 'admin', 'office', 'viewer'],
  },
  {
    slug: 'reports',
    label: 'Reports',
    category: 'operations',
    defaultRoles: ['owner', 'admin'],
  },
  {
    slug: 'employee-training',
    label: 'Employee Training',
    category: 'operations',
    defaultRoles: ['owner', 'admin', 'office', 'viewer'],
  },
  // AI Agents
  {
    slug: 'agent-training',
    label: 'Agent Training',
    category: 'agents',
    defaultRoles: ['owner', 'admin'],
  },
  {
    slug: 'knowledge-base',
    label: 'Knowledge Base',
    category: 'agents',
    defaultRoles: ['owner', 'admin', 'office', 'viewer'],
  },
  {
    slug: 'sms-conversations',
    label: 'SMS Conversations',
    category: 'agents',
    defaultRoles: ['owner', 'admin', 'office'],
  },
  {
    slug: 'call-logs',
    label: 'Call Logs',
    category: 'agents',
    defaultRoles: ['owner', 'admin', 'office'],
  },
  {
    slug: 'web-chat',
    label: 'Web Chat',
    category: 'agents',
    defaultRoles: ['owner', 'admin', 'office'],
  },
  // Future agents
  {
    slug: 'email-assistant',
    label: 'Email Assistant',
    category: 'agents',
    defaultRoles: ['owner', 'admin', 'office'],
  },
  {
    slug: 'office-operations',
    label: 'Office Operations',
    category: 'agents',
    defaultRoles: ['owner', 'admin', 'office'],
  },
  {
    slug: 'warehouse-inventory',
    label: 'Warehouse & Inventory',
    category: 'agents',
    defaultRoles: ['owner', 'admin', 'office'],
  },
  {
    slug: 'sales-outbound',
    label: 'Sales & Outbound',
    category: 'agents',
    defaultRoles: ['owner', 'admin'],
  },
  // Admin
  {
    slug: 'users',
    label: 'User Access',
    category: 'admin',
    ownerOnly: true,
    defaultRoles: ['owner'],
  },
]

export function findModule(slug: string | null | undefined): ModuleEntry | undefined {
  if (!slug) return undefined
  return MODULES.find((m) => m.slug === slug)
}
