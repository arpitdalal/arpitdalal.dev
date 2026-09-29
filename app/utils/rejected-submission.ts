/**
 * The one answer this site gives to a submission it refuses.
 *
 * Four different things can refuse a public form submission: a body that cannot
 * be read, a filled honeypot, a `from__confirm` that will not decrypt, and a
 * submission that skipped the honeypot fields altogether. All of them answer
 * with this same 400, and that is deliberate — see the two notes below, because
 * "same status" and "same body" are both load-bearing and both easy to relax by
 * accident.
 *
 * Lives in its own module rather than beside either check because it is needed
 * on both sides of the wire: the two `.server` modules throw it, and the client
 * error boundary has to recognise it to stay quiet. A `.server` import in a
 * client component would pull `node:crypto` and the honeypot into the browser
 * bundle, which is the whole reason those files are server-only.
 */

/**
 * The body text. Uniform on purpose: reporting which check failed hands a
 * scanner a map of what this endpoint validates, and there is nothing a client
 * can usefully do with the distinction.
 */
export const REJECTED_SUBMISSION = 'Form not submitted properly'
