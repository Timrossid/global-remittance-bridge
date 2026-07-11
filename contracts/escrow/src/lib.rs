#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, symbol_short, token};

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /**
     * Creates a new escrow instance and locks the specified amount of tokens.
     */
    pub fn create_escrow(env: Env, sender: Address, receiver: Address, token: Address, amount: i128) -> u64 {
        sender.require_auth();

        // Transfer tokens from sender to the contract (this contract's address)
        let client = token::Client::new(&env, &token);
        client.transfer(&sender, &env.current_contract_address(), &amount);

        // Generate a unique escrow ID
        let escrow_id = env.storage().persistent().get(&symbol_short!("next_id")).unwrap_or(0u64);
        let next_id = escrow_id + 1;
        env.storage().persistent().set(&symbol_short!("next_id"), &next_id);

        // Store escrow details using individual keys
        env.storage().persistent().set(&(escrow_id, symbol_short!("sender")), &sender);
        env.storage().persistent().set(&(escrow_id, symbol_short!("receiver")), &receiver);
        env.storage().persistent().set(&(escrow_id, symbol_short!("token")), &token);
        env.storage().persistent().set(&(escrow_id, symbol_short!("amount")), &amount);
        env.storage().persistent().set(&(escrow_id, symbol_short!("status")), &0u32); // 0 = Pending

        escrow_id
    }

    /**
     * Releases the escrowed funds to the designated receiver.
     */
    pub fn release_funds(env: Env, admin: Address, escrow_id: u64) {
        admin.require_auth();

        let status: u32 = env.storage().persistent().get(&(escrow_id, symbol_short!("status"))).expect("Escrow not found");

        if status != 0 {
            panic!("Escrow is not in pending state");
        }

        let receiver: Address = env.storage().persistent().get(&(escrow_id, symbol_short!("receiver"))).expect("Receiver not found");
        let token: Address = env.storage().persistent().get(&(escrow_id, symbol_short!("token"))).expect("Token not found");
        let amount: i128 = env.storage().persistent().get(&(escrow_id, symbol_short!("amount"))).expect("Amount not found");

        // Transfer tokens from the contract to the receiver
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &receiver, &amount);

        // Update status
        env.storage().persistent().set(&(escrow_id, symbol_short!("status")), &1u32); // 1 = Released
    }

    /**
     * Returns the escrowed funds back to the original sender.
     */
    pub fn refund_funds(env: Env, admin: Address, escrow_id: u64) {
        admin.require_auth();

        let status: u32 = env.storage().persistent().get(&(escrow_id, symbol_short!("status"))).expect("Escrow not found");

        if status != 0 {
            panic!("Escrow is not in pending state");
        }

        let sender: Address = env.storage().persistent().get(&(escrow_id, symbol_short!("sender"))).expect("Sender not found");
        let token: Address = env.storage().persistent().get(&(escrow_id, symbol_short!("token"))).expect("Token not found");
        let amount: i128 = env.storage().persistent().get(&(escrow_id, symbol_short!("amount"))).expect("Amount not found");

        // Transfer tokens from the contract back to the sender
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &sender, &amount);

        // Update status
        env.storage().persistent().set(&(escrow_id, symbol_short!("status")), &2u32); // 2 = Refunded
    }
}
