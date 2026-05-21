#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Map, String, Vec, U256};

#[contract]
pub struct GovLensContract;

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Vote {
    For,
    Against,
    Abstain,
}

#[derive(Clone, Debug)]
pub struct Proposal {
    pub id: u64,
    pub description_hash: String,
    pub voting_end_time: u64,
    pub for_votes: u64,
    pub against_votes: u64,
    pub abstain_votes: u64,
}

// Storage keys
const ADMIN: soroban_sdk::Symbol = soroban_sdk::symbol!("ADMIN");
const PROPOSAL_COUNT: soroban_sdk::Symbol = soroban_sdk::symbol!("PROPOSAL_COUNT");
const VOTING_DURATION: soroban_sdk::Symbol = soroban_sdk::symbol!("VOTING_DURATION");
const PROPOSAL: soroban_sdk::Symbol = soroban_sdk::symbol!("PROPOSAL");
const VOTER: soroban_sdk::Symbol = soroban_sdk::symbol!("VOTER");

#[contractimpl]
impl GovLensContract {
    /// Initialize the contract with admin address and default voting duration (in seconds)
    pub fn __init(env: Env, admin: Address, voting_duration: u64) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&VOTING_DURATION, &voting_duration);
        env.storage().instance().set(&PROPOSAL_COUNT, &0u64);
    }

    /// Create a new proposal
    pub fn create_proposal(
        env: Env,
        description_hash: String,
        voting_end_time: u64,
    ) -> u64 {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();

        let proposal_count: u64 = env.storage().instance().get(&PROPOSAL_COUNT).unwrap();
        let new_proposal_id = proposal_count + 1;

        let proposal = Proposal {
            id: new_proposal_id,
            description_hash,
            voting_end_time,
            for_votes: 0,
            against_votes: 0,
            abstain_votes: 0,
        };

        // Store proposal in Persistent storage
        let proposal_key = (PROPOSAL, new_proposal_id);
        env.storage().persistent().set(&proposal_key, &proposal);

        // Update proposal count in Instance storage
        env.storage().instance().set(&PROPOSAL_COUNT, &new_proposal_id);

        new_proposal_id
    }

    /// Vote on a proposal (For, Against, or Abstain)
    pub fn vote(env: Env, proposal_id: u64, vote_type: u64) {
        let voter: Address = env.storage().instance().get(&ADMIN).unwrap();
        voter.require_auth();

        // Check if proposal exists
        let proposal_key = (PROPOSAL, proposal_id);
        let mut proposal: Proposal = env.storage().persistent().get(&proposal_key)
            .unwrap_or_else(|| panic!("Proposal not found"));

        // Check if voting is still open
        let current_time = env.ledger().timestamp();
        if current_time >= proposal.voting_end_time {
            panic!("Voting has ended for this proposal");
        }

        // Check if voter has already voted
        let voter_key = (VOTER, proposal_id, voter.clone());
        if env.storage().persistent().has(&voter_key) {
            panic!("Voter has already voted on this proposal");
        }

        // Record the vote
        match vote_type {
            0 => proposal.for_votes += 1, // For
            1 => proposal.against_votes += 1, // Against
            2 => proposal.abstain_votes += 1, // Abstain
            _ => panic!("Invalid vote type"),
        }

        // Store updated proposal
        env.storage().persistent().set(&proposal_key, &proposal);

        // Mark voter as having voted
        env.storage().persistent().set(&voter_key, &true);
    }

    /// Get proposal details
    pub fn get_proposal(env: Env, proposal_id: u64) -> Proposal {
        let proposal_key = (PROPOSAL, proposal_id);
        env.storage().persistent().get(&proposal_key)
            .unwrap_or_else(|| panic!("Proposal not found"))
    }

    /// Get all proposal IDs
    pub fn get_all_proposal_ids(env: Env) -> Vec<u64> {
        let proposal_count: u64 = env.storage().instance().get(&PROPOSAL_COUNT).unwrap();
        let mut ids = Vec::new(&env);
        for i in 1..=proposal_count {
            ids.push(i);
        }
        ids
    }

    /// Check if a voter has voted on a proposal
    pub fn has_voted(env: Env, proposal_id: u64, voter: Address) -> bool {
        let voter_key = (VOTER, proposal_id, voter);
        env.storage().persistent().has(&voter_key)
    }

    /// Get voting duration
    pub fn get_voting_duration(env: Env) -> u64 {
        env.storage().instance().get(&VOTING_DURATION).unwrap()
    }

    /// Update voting duration (admin only)
    pub fn update_voting_duration(env: Env, new_duration: u64) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        env.storage().instance().set(&VOTING_DURATION, &new_duration);
    }
}
