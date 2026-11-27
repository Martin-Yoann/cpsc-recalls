# Claim flow regression checks

Run `npm run test:claim-flow` for isolated draft expiry, renewal and successful upload checks.

Build the website, start it on port 3105, then run `npm run test:p2-browser`. Set `VERIFICATION_BASE` to test another deployment. Chrome must be installed.

The browser checks read the published campaign to obtain its current product/evidence configuration. All browser API traffic is intercepted: draft creation, upload authorization, deletion, claim submission and account reads use simulated responses. No real claim, object storage write, account or email is created.

Coverage includes concurrent edits during failed upload, status reconciliation and deletion; expired draft restoration; expiry while filling the form; server-reported expiry with retained in-memory inputs; Spanish upload labels; list and dashboard errors, retries, empty results and expired login; and footer link destinations. The isolated upload check covers the successful object-upload branch without contacting object storage.

Additional checks cover resetting during a multi-file upload (one new draft and ignored old upload results) and retrying a failed draft renewal while retaining form inputs. Run `npm run test:claim-detail-browser` for both claim detail entry points: simulated 503 with retry, success, expired login, network failure and an actual not-found response. It uses the same base URL and intercepts all API traffic.
