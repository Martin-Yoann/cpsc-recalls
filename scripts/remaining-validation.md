# Follow-up status — 2026-11-27

## Confirmed defects addressed in this change

1. Late session validation or profile responses could restore a logged-out session or overwrite another login. Responses now check both credential revision and the current stored token; overlapping sign-ins and cross-tab credential changes are also guarded.
2. Logout retained local credentials while waiting for server revocation. Local storage and UI access now clear immediately; the server request still attempts to revoke the original token and cannot remove a subsequent login. Offline server revocation is not claimed as verified.
3. Failed disposal photo reads became an empty list. Known documents now survive failures, with a localized error and retry; review submission is disabled until the list is successfully refreshed.
4. Older disposal photo reads could restore removed documents or replace a newer list. Read revisions invalidate obsolete responses, polling waits for the preceding read, and reads pause during mutations.
5. Changing the disposal task could retain state belonging to the previous task. Task content is keyed by task ID so instructions, documents and declaration state start fresh for the new task.

Run `npm run test:auth-races` and `npm run test:session-disposal-browser`. The browser runner defaults to a local production build on port 3105; `VERIFICATION_BASE` selects another deployment. All API traffic is simulated, including logout, deletion and private reads. No real emails, accounts, claims, photos, payments or shipments are created.

## Follow-up verification completed — 2026-11-27

- Native local PostgreSQL integration run: 783 tests passed, zero failed, one Neon-specific test skipped. Of the previously skipped 147 tests, 146 now passed against real SQL with all migrations and synthetic fixtures.
- A real verification email reached the designated test mailbox's inbox, confirmed by its recipient. The actual frontend, local API and native SQL database completed session-bound confirmation; a new login remained denied until separately verified. No production account was created.
- Actual browser file bytes were written to local private storage, reconciled into the database, shown as verified, scheduled for removal, physically deleted by the real cleanup worker, and marked deleted in SQL. This run used `scan_status=not_run`; it does not establish a real antivirus scan.
- Database tests passed for refund completion records, replacement shipment records and their email queue events. No money moved and no shipment was purchased or dispatched.

The backend now provides `pnpm test:db:local` with an explicit disposable loopback test URL. It isolates deployment credentials and installs both English and Spanish templates before testing. The obsolete escalation test now requires the independent reportability review before closure; the business gate was preserved.

## Remaining validation and content dependencies

These are not reported as passed:

- The single real Neon pooled/WebSocket transaction test requires a dedicated Neon test database URL. The current Neon login did not expose the application project, so no unrelated cloud project or branch was created.
- Vercel private Blob upload, signed callback, reconciliation and deletion still require isolated cloud storage and database targets. Local storage completion does not establish cloud-provider completion.
- A real antivirus service and its result-return path have not been verified. The successful local upload used the explicit no-scan policy; it must not be described as malware-clean.
- Actual payment and shipping-provider operations require selected providers and their sandbox configuration. The tested record/queue flows do not establish a payment settlement or parcel dispatch.
- Legal and accessibility statements require approved text before their footer entries can be published.
- Spanish recall/disposal business content remains subject to the previously requested content review. The language selector stays hidden.
- Delivery to the designated mailbox passed; Gmail/Outlook, real mobile mail applications and cross-browser opening behavior have not all been tested.
