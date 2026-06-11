import { Request } from 'express';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export function getRefreshTokenFromCookie(req: Request): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === REFRESH_TOKEN_COOKIE) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
}

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export { REFRESH_TOKEN_COOKIE };
