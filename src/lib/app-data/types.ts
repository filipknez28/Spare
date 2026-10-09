/**
 * App-data bridge constants shared by the preview host bridge.
 *
 * `CONNECTOR_TOKEN_READY_EVENT` is the window event the guest dispatches once a
 * connector token handoff from the embedder is ready to consume. Only consumed
 * inside the Grok embed frame; top-level runs never dispatch it.
 */
export const CONNECTOR_TOKEN_READY_EVENT = "grok-preview-connector-token-ready";
