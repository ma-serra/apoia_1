import * as jose from 'jose'
import { SHA256 } from 'crypto-js'
import { envString } from './env'

const buildJwt = async (system: string, name: string, password: string) => {
  const jwtsecret = new TextEncoder().encode(envString('JWT_SECRET'))
  const alg = 'HS256'
  const jwt = await new jose.SignJWT({ system, name, password })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(envString('JWT_ISSUER') as string)
    .setAudience(envString('JWT_AUDIENCE') as string)
    .setExpirationTime('2h')
    .sign(jwtsecret)
  return jwt
}

async function sha256(message: string): Promise<Uint8Array> {
  // Converte a string em um array de bytes (Uint8Array)
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Gera o hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Converte o ArrayBuffer em um Uint8Array
  const hashArray = new Uint8Array(hashBuffer);

  return hashArray;
}

export const buildJweToken = async (claims: any) => {
  const secret = await sha256(envString('JWT_SECRET') as string)

  const jwt = await buildJwt(claims.system, claims.name, claims.password)

  const jwtEncoded = new TextEncoder().encode(jwt)
  const jwe = await new jose.CompactEncrypt(jwtEncoded)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .encrypt(secret)

  return jwe
}

interface TokenClaims { name: string, password: string, system: string }

export const verifyJweToken = async (token: string): Promise<TokenClaims> => {
  try {
    // Validate input
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format')
    }

    const secret = await sha256(envString('JWT_SECRET') as string)
    const jwtsecret = new TextEncoder().encode(envString('JWT_SECRET'))

    // jwe is token without the "Bearer " prefix
    const jwe = token.replace('Bearer ', '').trim()

    // Validate that we have a token after removing the Bearer prefix
    if (!jwe) {
      throw new Error('Invalid token format')
    }

    const { plaintext: jwt } = await jose.compactDecrypt(jwe, secret)

    const { payload, protectedHeader } = await jose.jwtVerify(jwt, jwtsecret, {
      issuer: envString('JWT_ISSUER') as string,
      audience: envString('JWT_AUDIENCE') as string,
    })

    return payload as unknown as TokenClaims
  } catch (error) {
    // Log the error for debugging but don't expose details to the caller
    console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    throw new Error('Invalid or expired token')
  }
}