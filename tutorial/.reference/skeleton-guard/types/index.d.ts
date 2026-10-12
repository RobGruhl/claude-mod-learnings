export type Tally = { sessions: number; tools: number; held: number }

declare module 'claude-code' {
  interface PluginState {
    'skeleton-guard': { session: Tally; allTime: Tally }
  }
}
