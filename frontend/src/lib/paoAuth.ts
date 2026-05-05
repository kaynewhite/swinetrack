const PAO_SESSION_KEY = "pao_session";

export interface PAOUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  municipality: string;
}

export interface PAOSession {
  user: PAOUser;
  token: string;
  expiresAt: number;
}

export function getPAOSession(): PAOSession | null {
  try {
    const raw = localStorage.getItem(PAO_SESSION_KEY);
    if (!raw) return null;
    const session: PAOSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(PAO_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setPAOSession(session: PAOSession) {
  localStorage.setItem(PAO_SESSION_KEY, JSON.stringify(session));
}

export function clearPAOSession() {
  localStorage.removeItem(PAO_SESSION_KEY);
}
