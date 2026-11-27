# Follow-up status — 2026-11-27

## Confirmed defects addressed in this change

1. Late session validation or profile responses could restore a logged-out session or overwrite another login. Responses now check both credential revision and the current stored token; overlapping sign-ins and cross-tab credential changes are also guarded.
2. Logout retained local credentials while waiting for server revocation. Local storage and UI access now clear immediately; the server request still attempts to revoke the original token and cannot remove a subsequent login. Offline server revocation is not claimed as verified.
3. Failed disposal photo reads became an empty list. Known documents now survive failures, with a localized error and retry; review submission is disabled until the list is successfully refreshed.
4. Older disposal photo reads could restore removed documents or replace a newer list. Read revisions invalidate obsolete responses, polling waits for the preceding read, and reads pause during mutations.
5. Changing the disposal task could retain state belonging to the previous task. Task content is keyed by task ID so instructions, documents and declaration state start fresh for the new task.

Run `npm run test:auth-races` and `npm run test:session-disposal-browser`. The browser runner defaults to a local production build on port 3105; `VERIFICATION_BASE` selects another deployment. All API traffic is simulated, including logout, deletion and private reads. No real emails, accounts, claims, photos, payments or shipments are created.

## Remaining validation and content dependencies

These are not established software defects and must not be reported as passed:

- Actual mailbox delivery and same-session verification through real mail applications: requires a designated test mailbox and review of received messages/spam placement.
- Real private object upload, reconciliation/scanning and deletion: requires an isolated storage and database environment with disposable test files.
- Real refund and shipment processing: requires provider sandbox credentials and designated test cases; do not trigger live financial or logistics actions for testing.
- Database-dependent API integration suites (previously 147 skipped tests): require an isolated database and the integration opt-in switches. The Neon pooled transaction test additionally needs its dedicated test URL. Do not point these suites at production.
- Legal and accessibility statements: the misleading footer links have been removed; approved text is needed before publishing corresponding pages.
- Published Spanish business content: the language selector remains hidden pending the previously requested content review. Spanish UI strings do not substitute for approval of translated recall/disposal content.
