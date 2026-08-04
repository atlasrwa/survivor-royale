'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

// ═══════════════════════════════════════════════════════
// Base USDC Contract
// ═══════════════════════════════════════════════════════

/** USDC on Base Mainnet (Circle official deployment) */
export const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

/** USDC has 6 decimals */
export const USDC_DECIMALS = 6;

/** Standard ERC-20 ABI subset for USDC interactions */
export const USDC_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ═══════════════════════════════════════════════════════
// Game Treasury Address (receives USDC payments)
// ═══════════════════════════════════════════════════════

const GAME_TREASURY_ADDRESS = (process.env.NEXT_PUBLIC_TREASURY_ADDRESS ??
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

// ═══════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════

/**
 * Read the connected player's USDC balance on Base.
 */
export function useUSDCBalance() {
  const { address } = useAccount();

  const result = useReadContract({
    address: BASE_USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  return {
    /** Raw balance in smallest unit (6 decimals) */
    raw: result.data,
    /** Formatted balance as string (e.g. "125.50") */
    formatted: result.data ? formatUnits(result.data, USDC_DECIMALS) : '0',
    /** Balance as number */
    value: result.data ? Number(formatUnits(result.data, USDC_DECIMALS)) : 0,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  };
}

/**
 * Check USDC allowance for a given spender (e.g. tournament contract).
 */
export function useUSDCAllowance(spender: `0x${string}`) {
  const { address } = useAccount();

  const result = useReadContract({
    address: BASE_USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address!, spender],
    query: {
      enabled: !!address && spender !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    raw: result.data,
    formatted: result.data ? formatUnits(result.data, USDC_DECIMALS) : '0',
    isLoading: result.isLoading,
    refetch: result.refetch,
  };
}

/**
 * Approve USDC spending for a contract (e.g. tournament entry fee).
 */
export function useUSDCApprove() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const approve = (spender: `0x${string}`, amountUSDC: number) => {
    writeContract({
      address: BASE_USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [spender, parseUnits(amountUSDC.toString(), USDC_DECIMALS)],
    });
  };

  return { approve, isPending, isSuccess, error };
}

/**
 * Pay USDC to the game treasury (e.g. tournament entry, battle pass purchase).
 * Amount is in human-readable USDC (e.g. 5.00 = $5).
 */
export function useUSDCPayment() {
  const { writeContract, isPending, isSuccess, error, data: txHash } = useWriteContract();

  const pay = (amountUSDC: number, memo?: string) => {
    void memo; // Could be used for off-chain tracking
    writeContract({
      address: BASE_USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [GAME_TREASURY_ADDRESS, parseUnits(amountUSDC.toString(), USDC_DECIMALS)],
    });
  };

  return { pay, isPending, isSuccess, error, txHash };
}

/**
 * Utility: format a USDC amount for display.
 */
export function formatUSDC(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Utility: parse raw USDC (6 decimals) to human-readable number.
 */
export function parseUSDCRaw(raw: bigint): number {
  return Number(formatUnits(raw, USDC_DECIMALS));
}
