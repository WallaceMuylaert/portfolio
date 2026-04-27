/**
 * Auth Service
 * Gerencia autenticação do painel admin.
 * Utiliza SHA-256 para hash de senha e sessionStorage para sessão.
 */

const AUTH_KEYS = {
  SESSION: 'portfolio_admin_session',
  CREDENTIALS: 'portfolio_admin_credentials',
};

// Credenciais padrão — devem ser alteradas no primeiro acesso
const DEFAULT_CREDENTIALS = {
  username: 'wallace',
  // Hash SHA-256 de 'admin123' — a senha padrão
  passwordHash: null,
};

/**
 * Gera hash SHA-256 de uma string
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Inicializa as credenciais padrão se não existirem
 */
async function ensureCredentials() {
  const stored = localStorage.getItem(AUTH_KEYS.CREDENTIALS);
  if (!stored) {
    const hash = await hashPassword('admin123');
    const credentials = {
      username: DEFAULT_CREDENTIALS.username,
      passwordHash: hash,
    };
    localStorage.setItem(AUTH_KEYS.CREDENTIALS, JSON.stringify(credentials));
    return credentials;
  }
  return JSON.parse(stored);
}

/**
 * Tenta fazer login com username e senha
 * @returns {{ success: boolean, error?: string }}
 */
export async function login(username, password) {
  const credentials = await ensureCredentials();
  const inputHash = await hashPassword(password);

  if (username !== credentials.username) {
    return { success: false, error: 'Usuário não encontrado' };
  }

  if (inputHash !== credentials.passwordHash) {
    return { success: false, error: 'Senha incorreta' };
  }

  // Criar sessão com expiração de 2 horas
  const session = {
    username,
    loginAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };

  sessionStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
  return { success: true };
}

/**
 * Verifica se há uma sessão ativa e válida
 */
export function isAuthenticated() {
  try {
    const session = sessionStorage.getItem(AUTH_KEYS.SESSION);
    if (!session) return false;

    const { expiresAt } = JSON.parse(session);
    return new Date(expiresAt) > new Date();
  } catch {
    return false;
  }
}

/**
 * Retorna dados da sessão atual
 */
export function getSession() {
  try {
    const session = sessionStorage.getItem(AUTH_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

/**
 * Encerra a sessão
 */
export function logout() {
  sessionStorage.removeItem(AUTH_KEYS.SESSION);
}

/**
 * Altera a senha do admin
 */
export async function changePassword(currentPassword, newPassword) {
  const credentials = await ensureCredentials();
  const currentHash = await hashPassword(currentPassword);

  if (currentHash !== credentials.passwordHash) {
    return { success: false, error: 'Senha atual incorreta' };
  }

  const newHash = await hashPassword(newPassword);
  credentials.passwordHash = newHash;
  localStorage.setItem(AUTH_KEYS.CREDENTIALS, JSON.stringify(credentials));
  return { success: true };
}
