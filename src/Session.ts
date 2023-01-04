import { SignalClient } from "./signal/signal";

export class Session {
  constructor(readonly id = getId()) {}
}

/** Load from session storage or generate uuid */
function getId() {
  const key = "session_id_key";
  const stored = sessionStorage.getItem(key);
  if (stored) {
    return stored;
  }

  const generated = crypto.randomUUID();
  sessionStorage.setItem(key, generated);

  return generated;
}

// @ts-ignore
window.SignalClient = SignalClient;
// const s = new SignalClient('thing-thing')
