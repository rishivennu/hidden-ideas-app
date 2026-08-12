// ── Single source of truth for which sign-in methods are offered ────────────
//
// Flip these two booleans to control Google sign-in across the whole app.
// Nothing else needs editing — AuthPanel (the /login + /signup page) and
// ModalAuth (the admin + download prompt) both read from here.

/**
 * Google button on the PUBLIC login / signup page.
 * true   → the "Gmail" tab is shown alongside Email and Mobile. (current setting)
 * false  → visitors only see Email and Mobile.
 */
export const GOOGLE_AUTH_PUBLIC: boolean = true

/**
 * Google button on the ADMIN sign-in prompt at /admin.
 * Kept true so the owner always has a one-tap way in, even with the
 * public button switched off. Set false to require email magic-link.
 */
export const GOOGLE_AUTH_ADMIN: boolean = true

/**
 * Options passed to supabase.auth.signInWithOAuth for Google.
 *
 * prompt:'select_account' is the important bit — without it Google silently
 * reuses whichever account the browser has as its default, so a user with
 * several Gmail accounts can never pick. This forces the chooser every time.
 */
export function googleOAuthOptions(redirectTo: string) {
  return {
    redirectTo,
    queryParams: {
      prompt: 'select_account',
      access_type: 'online',
    },
  } as const
}
