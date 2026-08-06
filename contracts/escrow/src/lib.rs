#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env};

#[contract]
pub struct EscrowContract;

const INSTANCE_TTL_THRESHOLD: u32 = 1_000;
const INSTANCE_TTL_EXTEND_TO: u32 = 100_000;
const PERSISTENT_TTL_THRESHOLD: u32 = 1_000;
const PERSISTENT_TTL_EXTEND_TO: u32 = 100_000;

#[contractimpl]
impl EscrowContract {
    /// Sets the one-time administrator used for release and refund actions.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage()
            .instance()
            .set(&symbol_short!("admin"), &admin);
        Self::extend_instance_ttl(&env);
    }

    /// Transfers administrative control to a new address.
    pub fn transfer_admin(env: Env, current_admin: Address, new_admin: Address) {
        current_admin.require_auth();
        Self::require_admin(&env, &current_admin);
        new_admin.require_auth();
        env.storage()
            .instance()
            .set(&symbol_short!("admin"), &new_admin);
        Self::extend_instance_ttl(&env);
    }

    /**
     * Creates a new escrow instance and locks the specified amount of tokens.
     */
    pub fn create_escrow(
        env: Env,
        sender: Address,
        receiver: Address,
        token: Address,
        amount: i128,
    ) -> u64 {
        sender.require_auth();
        Self::ensure_initialized(&env);

        // Transfer tokens from sender to the contract (this contract's address)
        let client = token::Client::new(&env, &token);
        client.transfer(&sender, env.current_contract_address(), &amount);

        // Generate a unique escrow ID
        let escrow_id = env
            .storage()
            .persistent()
            .get(&symbol_short!("next_id"))
            .unwrap_or(0u64);
        let next_id = escrow_id + 1;
        env.storage()
            .persistent()
            .set(&symbol_short!("next_id"), &next_id);

        // Store escrow details using individual keys
        env.storage()
            .persistent()
            .set(&(escrow_id, symbol_short!("sender")), &sender);
        env.storage()
            .persistent()
            .set(&(escrow_id, symbol_short!("receiver")), &receiver);
        env.storage()
            .persistent()
            .set(&(escrow_id, symbol_short!("token")), &token);
        env.storage()
            .persistent()
            .set(&(escrow_id, symbol_short!("amount")), &amount);
        env.storage()
            .persistent()
            .set(&(escrow_id, symbol_short!("status")), &0u32); // 0 = Pending
        Self::extend_escrow_ttl(&env, escrow_id);
        Self::extend_next_id_ttl(&env);

        escrow_id
    }

    /**
     * Releases the escrowed funds to the designated receiver.
     */
    pub fn release_funds(env: Env, admin: Address, escrow_id: u64) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        Self::extend_escrow_ttl(&env, escrow_id);

        let status: u32 = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("status")))
            .expect("Escrow not found");

        if status != 0 {
            panic!("Escrow is not in pending state");
        }

        let receiver: Address = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("receiver")))
            .expect("Receiver not found");
        let token: Address = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("token")))
            .expect("Token not found");
        let amount: i128 = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("amount")))
            .expect("Amount not found");

        // Transfer tokens from the contract to the receiver
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &receiver, &amount);

        // Update status
        env.storage()
            .persistent()
            .set(&(escrow_id, symbol_short!("status")), &1u32); // 1 = Released
    }

    /**
     * Returns the escrowed funds back to the original sender.
     */
    pub fn refund_funds(env: Env, admin: Address, escrow_id: u64) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        Self::extend_escrow_ttl(&env, escrow_id);

        let status: u32 = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("status")))
            .expect("Escrow not found");

        if status != 0 {
            panic!("Escrow is not in pending state");
        }

        let sender: Address = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("sender")))
            .expect("Sender not found");
        let token: Address = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("token")))
            .expect("Token not found");
        let amount: i128 = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("amount")))
            .expect("Amount not found");

        // Transfer tokens from the contract back to the sender
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &sender, &amount);

        // Update status
        env.storage()
            .persistent()
            .set(&(escrow_id, symbol_short!("status")), &2u32); // 2 = Refunded
    }

    fn ensure_initialized(env: &Env) {
        if !env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Contract not initialized — call initialize first");
        }
        Self::extend_instance_ttl(env);
    }

    fn require_admin(env: &Env, admin: &Address) {
        Self::ensure_initialized(env);
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .expect("Contract not initialized — call initialize first");
        if admin != &stored_admin {
            panic!("Unauthorized: caller is not the registered admin");
        }
    }

    fn extend_instance_ttl(env: &Env) {
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND_TO);
    }

    fn extend_next_id_ttl(env: &Env) {
        env.storage().persistent().extend_ttl(
            &symbol_short!("next_id"),
            PERSISTENT_TTL_THRESHOLD,
            PERSISTENT_TTL_EXTEND_TO,
        );
    }

    fn extend_escrow_ttl(env: &Env, escrow_id: u64) {
        for field in [
            symbol_short!("sender"),
            symbol_short!("receiver"),
            symbol_short!("token"),
            symbol_short!("amount"),
            symbol_short!("status"),
        ] {
            env.storage().persistent().extend_ttl(
                &(escrow_id, field),
                PERSISTENT_TTL_THRESHOLD,
                PERSISTENT_TTL_EXTEND_TO,
            );
        }
    }
}

#[cfg(test)]
mod test;
