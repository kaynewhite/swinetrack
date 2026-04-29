// Local, browser-only account store for development / capstone demo.
// Accounts and the active session live in localStorage — no backend, no API keys.
// Replace with a real auth provider before any production use.

const ACCOUNTS_KEY = "swinetrack.accounts.v1";
const SESSION_KEY = "swinetrack.session.v1";

export type AccountType =
  | "Admin (MAO)"
  | "PAO Officer"
  | "Farm Owner"
  | "Veterinarian";

export interface StoredAccount {
  id: string;
  email: string;
  fullName: string;
  accountType: AccountType;
  passwordHash: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  accountType: AccountType;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// Simple non-cryptographic hash. Good enough to avoid storing raw passwords
// in localStorage for a demo build. NOT secure for real users.
function hash(input: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, "0")
  );
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toSessionUser(account: StoredAccount): SessionUser {
  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    accountType: account.accountType,
  };
}

function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  accountType: AccountType;
}

export async function signUp(input: SignUpInput): Promise<SessionUser> {
  // Simulated network latency for nicer UX feedback.
  await new Promise((r) => setTimeout(r, 350));

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!fullName) throw new AuthError("Please enter your full name.");
  if (!email) throw new AuthError("Please enter your email address.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new AuthError("Please enter a valid email address.");
  if (password.length < 6)
    throw new AuthError("Password must be at least 6 characters.");

  const accounts = readAccounts();
  if (accounts.some((a) => a.email === email)) {
    throw new AuthError("An account already exists for this email.");
  }

  const account: StoredAccount = {
    id: makeId(),
    email,
    fullName,
    accountType: input.accountType,
    passwordHash: hash(password),
    createdAt: new Date().toISOString(),
  };

  accounts.push(account);
  writeAccounts(accounts);

  const user = toSessionUser(account);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export interface SignInInput {
  email: string;
  password: string;
}

export async function signIn(input: SignInInput): Promise<SessionUser> {
  await new Promise((r) => setTimeout(r, 350));

  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    throw new AuthError("Please enter your email and password.");
  }

  const accounts = readAccounts();
  const account = accounts.find((a) => a.email === email);
  if (!account || account.passwordHash !== hash(password)) {
    throw new AuthError("Incorrect email or password.");
  }

  const user = toSessionUser(account);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.email === "string"
    ) {
      return parsed as SessionUser;
    }
    return null;
  } catch {
    return null;
  }
}
