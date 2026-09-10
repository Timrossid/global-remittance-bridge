import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  walletAddress: z.string().regex(/^G[A-Z0-9]{55}$/, 'Invalid Stellar address'),
});

export const transferSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  asset: z.string().max(12, 'Asset code too long'),
  assetIssuer: z.string().regex(/^G[A-Z0-9]{55}$/, 'Invalid issuer address').optional(),
});

export const escrowSchema = z.object({
  senderAddress: z.string().regex(/^G[A-Z0-9]{55}$/, 'Invalid sender address'),
  tokenAddress: z.string().regex(/^G[A-Z0-9]{55}$|^C[A-Z0-9]{55}$/, 'Invalid token address'),
  amount: z.number().int('Amount must be an integer').positive('Amount must be positive'),
});

export const feedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  walletAddress: z.string().regex(/^G[A-Z0-9]{55}$/, 'Invalid wallet address'),
  network: z.string().max(20).optional(),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  likedMost: z.string().min(1, 'This field is required'),
  missingFeature: z.string().min(1, 'This field is required'),
  issues: z.string().min(1, 'This field is required'),
  recommend: z.string().min(1, 'This field is required'),
  improvements: z.string().min(1, 'This field is required'),
});
