import { 
  Contract, 
  SorobanRpc, 
  TransactionBuilder, 
  Networks,
  BASE_FEE,
  xdr
} from '@stellar/stellar-sdk';

// Configuration
const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org:443';
const CONTRACT_ID = process.env.CONTRACT_ID || '';

// Initialize RPC server
export const rpcServer = new SorobanRpc.Server(RPC_URL, {
  allowHttp: true,
});

// Get contract instance
export function getContract(contractId: string = CONTRACT_ID): Contract {
  return new Contract(contractId);
}

// Connect to Freighter Wallet
export async function connectFreighter(): Promise<string> {
  if (!window.freighter) {
    throw new Error('Freighter wallet is not installed');
  }

  try {
    const publicKey = await window.freighter.getPublicKey();
    return publicKey;
  } catch (error) {
    console.error('Error connecting to Freighter:', error);
    throw new Error('Failed to connect to Freighter wallet');
  }
}

// Sign transaction with Freighter
export async function signTransactionWithFreighter(xdrString: string): Promise<string> {
  if (!window.freighter) {
    throw new Error('Freighter wallet is not installed');
  }

  try {
    const signedXdr = await window.freighter.signTransaction(xdrString, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    return signedXdr;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw new Error('Failed to sign transaction with Freighter');
  }
}

// Build and submit transaction
export async function buildAndSubmitTransaction(
  operation: xdr.Operation,
  publicKey: string
): Promise<string> {
  try {
    // Get account details
    const account = await rpcServer.getAccount(publicKey);
    
    // Build transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Sign with Freighter
    const signedXdr = await signTransactionWithFreighter(transaction.toXDR());
    
    // Convert signed XDR back to transaction
    const signedTransaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    
    // Submit transaction
    const result = await rpcServer.sendTransaction(signedTransaction);
    
    if (result.status === 'PENDING') {
      // Wait for transaction to be confirmed
      const txResponse = await rpcServer.getTransaction(result.hash);
      if (txResponse.status === 'SUCCESS') {
        return result.hash;
      } else {
        throw new Error(`Transaction failed: ${txResponse.status}`);
      }
    } else {
      throw new Error(`Transaction submission failed: ${result.status}`);
    }
  } catch (error) {
    console.error('Error building and submitting transaction:', error);
    throw error;
  }
}

// Contract interaction functions
export async function createProposal(
  descriptionHash: string,
  votingEndTime: number,
  publicKey: string
): Promise<string> {
  const contract = getContract();
  const operation = contract.call(
    'create_proposal',
    contract.param('description_hash', descriptionHash),
    contract.param('voting_end_time', votingEndTime)
  );
  
  return buildAndSubmitTransaction(operation, publicKey);
}

export async function vote(
  proposalId: number,
  voteType: number, // 0: For, 1: Against, 2: Abstain
  publicKey: string
): Promise<string> {
  const contract = getContract();
  const operation = contract.call(
    'vote',
    contract.param('proposal_id', proposalId),
    contract.param('vote_type', voteType)
  );
  
  return buildAndSubmitTransaction(operation, publicKey);
}

export async function getProposal(proposalId: number): Promise<any> {
  const contract = getContract();
  const result = await contract.simulate('get_proposal', {
    proposal_id: proposalId,
  });
  
  return result.result;
}

export async function getAllProposalIds(): Promise<number[]> {
  const contract = getContract();
  const result = await contract.simulate('get_all_proposal_ids', {});
  
  return result.result;
}

export async function hasVoted(proposalId: number, voterAddress: string): Promise<boolean> {
  const contract = getContract();
  const result = await contract.simulate('has_voted', {
    proposal_id: proposalId,
    voter: voterAddress,
  });
  
  return result.result;
}

// Type declarations for Freighter
declare global {
  interface Window {
    freighter?: {
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, options: { networkPassphrase: string }) => Promise<string>;
      isConnected: () => Promise<boolean>;
    };
  }
}
