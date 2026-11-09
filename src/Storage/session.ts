interface Session {
  readonly token: string;
}

let session: Session | undefined;

export function beginSession(token: string) {
  session = { token };
}

export function getSession() {
  return session;
}

export function clearSession() {
  session = undefined;
}
