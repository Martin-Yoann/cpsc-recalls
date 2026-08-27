// Design §9 / §14: demo fixtures are readable only when the deployment
// explicitly opts in. Client components import this constant; note that the
// env var is inlined at build time for client bundles.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
