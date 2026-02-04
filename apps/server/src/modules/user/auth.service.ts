import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import nacl from 'tweetnacl';
import { Address } from '@ton/core';
import { sha256 } from '@ton/crypto';
import { AUTH_CONFIG } from '../../core/constants.js';

export interface TonProofPayload {
  address: string;
  network: string;
  public_key: string;
  proof: {
    timestamp: number;
    domain: {
      lengthBytes: number;
      value: string;
    };
    signature: string;
    payload: string;
    state_init?: string;
  };
}

export class AuthService {
  private readonly appDomain = 'polygram.app'; // Should match frontend configuration

  /**
   * Generates a secure random payload (nonce) for ton_proof
   */
  async generatePayload(): Promise<string> {
    return crypto.randomBytes(AUTH_CONFIG.PAYLOAD_BYTES_LENGTH).toString('hex');
  }

  /**
   * Verifies the ton_proof signature
   * Logic based on TON Connect 2.0 specification
   */
  async verifyProof(payload: TonProofPayload, expectedPayload: string): Promise<boolean> {
    try {
      const { proof, address, public_key } = payload;

      // 1. Basic checks
      if (proof.payload !== expectedPayload) {
        console.error('[Auth] Payload mismatch');
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      if (now - proof.timestamp > AUTH_CONFIG.PAYLOAD_EXPIRY_SECONDS) {
        console.error('[Auth] Proof expired');
        return false;
      }

      // 2. Reconstruct the message that was signed
      // Structure: "ton-proof-item-v2" + L1 + address + L2 + domain + L3 + timestamp + L4 + payload
      const addr = Address.parse(address);
      
      const message = Buffer.concat([
        Buffer.from('ton-proof-item-v2'),
        Buffer.alloc(4), // Uint32 Workchain (Big Endian)
        addr.hash,
        this.intToBuffer(proof.domain.lengthBytes, 4),
        Buffer.from(proof.domain.value),
        this.intToBuffer(proof.timestamp, 8),
        Buffer.from(proof.payload)
      ]);

      // Set workchain in message (bytes 17-20)
      message.writeInt32BE(addr.workChain, 17);

      const messageHash = await sha256(message);
      
      // TON Proof actually signs a prefix + messageHash
      const fullMessage = Buffer.concat([
        Buffer.from([0xff, 0xff]),
        Buffer.from('ton-connect'),
        messageHash
      ]);
      const finalHash = await sha256(fullMessage);

      // 3. Verify ed25519 signature
      const publicKeyBuffer = Buffer.from(public_key, 'hex');
      const signatureBuffer = Buffer.from(proof.signature, 'base64');

      return nacl.sign.detached.verify(
        finalHash,
        signatureBuffer,
        publicKeyBuffer
      );
    } catch (err) {
      console.error('[Auth] Verification failed:', err);
      return false;
    }
  }

  private intToBuffer(value: number, length: number): Buffer {
    const buffer = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = value & 0xff;
      value = value >> 8;
    }
    return buffer;
  }
}
