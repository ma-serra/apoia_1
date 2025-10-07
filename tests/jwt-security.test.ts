import { verifyJweToken } from '../lib/utils/jwt'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing'
process.env.JWT_ISSUER = 'test-issuer'
process.env.JWT_AUDIENCE = 'test-audience'

describe('JWT Security Tests', () => {
  describe('verifyJweToken', () => {
    it('should reject null token', async () => {
      await expect(verifyJweToken(null as any)).rejects.toThrow('Invalid or expired token')
    })

    it('should reject empty string token', async () => {
      await expect(verifyJweToken('')).rejects.toThrow('Invalid or expired token')
    })

    it('should reject token with only spaces', async () => {
      await expect(verifyJweToken('   ')).rejects.toThrow('Invalid or expired token')
    })

    it('should reject non-string token', async () => {
      await expect(verifyJweToken(123 as any)).rejects.toThrow('Invalid or expired token')
    })

    it('should reject token with only "Bearer" prefix', async () => {
      await expect(verifyJweToken('Bearer ')).rejects.toThrow('Invalid or expired token')
    })

    it('should reject malformed token', async () => {
      await expect(verifyJweToken('Bearer invalid-token')).rejects.toThrow('Invalid or expired token')
    })

    it('should reject token without Bearer prefix that is malformed', async () => {
      await expect(verifyJweToken('invalid-token')).rejects.toThrow('Invalid or expired token')
    })
  })
})
