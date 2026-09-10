#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env, Symbol, Vec};

#[contract]
pub struct EscrowContract;

const INSTANCE_TTL_THRESHOLD: u32 = 1_000;
const INSTANCE_TTL_EXTEND_TO: u32 = 100_000;
const PERSISTENT_TTL_THRESHOLD: u32 = 1_000;
const PERSISTENT_TTL_EXTEND_TO: u32 = 100_000;
const DEFAULT_EXPIRATION_SECONDS: u64 = 86400;

const TOPIC_INITIALIZED: Symbol = symbol_short!("init");
const TOPIC_ADMIN_TRANSFERRED: Symbol = symbol_short!("admin_xfer");
const TOPIC_ESCROW_CREATED: Symbol = symbol_short!("escrow_created");
const TOPIC_ESCROW_RELEASED: Symbol = symbol_short!("escrow_released");
const TOPIC_ESCROW_REFUNDED: Symbol = symbol_short!("escrow_refunded");
const TOPIC_PAUSED: Symbol = symbol_short!("paused");
const TOPIC_UNPAUSED: Symbol = symbol_short!("unpaused");

const CONTRACT_VERSION: u32 = 1;
const STATUS_PENDING: u32 = 0;
const STATUS_RELEASED: u32 = 1;
const STATUS_REFUNDED: u32 = 2;
const STATUS_EXPIRED: u32 = 3;
const MIN_AMOUNT: i128 = 1;
const MAX_AMOUNT: i128 = 1_000_000_000_000;

#[contractimpl]
impl EscrowContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage()
            .instance()
            .set(&symbol_short!("admin"), &admin);
        Self::extend_instance_ttl(&env);
        env.events().publish((TOPIC_INITIALIZED,), admin);
    }

    pub fn transfer_admin(env: Env, current_admin: Address, new_admin: Address) {
        current_admin.require_auth();
        Self::require_admin(&env, &current_admin);
        new_admin.require_auth();
        env.storage()
            .instance()
            .set(&symbol_short!("admin"), &new_admin);
        Self::extend_instance_ttl(&env);
        env.events()
            .publish((TOPIC_ADMIN_TRANSFERRED, current_admin, new_admin), ());
    }

    pub fn pause(env: Env, admin: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&symbol_short!("paused"), &true);
        Self::extend_instance_ttl(&env);
        env.events().publish((TOPIC_PAUSED,), admin);
    }

    pub fn unpause(env: Env, admin: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&symbol_short!("paused"), &false);
        Self::extend_instance_ttl(&env);
        env.events().publish((TOPIC_UNPAUSED,), admin);
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&symbol_short!("paused")).unwrap_or(false)
    }

    pub fn create_escrow(
        env: Env,
        sender: Address,
        receiver: Address,
        token: Address,
        amount: i128,
    ) -> u64 {
        sender.require_auth();
        Self::ensure_initialized(&env);
        if Self::is_paused(&env) {
            panic!("Contract is paused");
        }

        if amount <= 0 || amount < MIN_AMOUNT || amount > MAX_AMOUNT {
            panic!("Amount must be between MIN_AMOUNT and MAX_AMOUNT");
        }
        let client = token::Client::new(&env, &token);
        client.transfer(&sender, env.current_contract_address(), &amount);

        let escrow_id = env
            .storage()
            .persistent()
            .get(&symbol_short!("next_id"))
            .unwrap_or(0u64);
        let next_id = escrow_id + 1;
        env.storage()
            .persistent()
            .set(&symbol_short!("next_id"), &next_id);

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
            .set(&(escrow_id, symbol_short!("status")), &STATUS_PENDING);
        env.storage()
            .persistent()
            .set(&(escrow_id, symbol_short!("created_at")), &env.ledger().timestamp());
        Self::extend_escrow_ttl(&env, escrow_id);
        Self::extend_next_id_ttl(&env);

        env.events().publish(
            (TOPIC_ESCROW_CREATED,),
            (escrow_id, sender, receiver, token, amount),
        );
        escrow_id
    }

    pub fn release_funds(env: Env, admin: Address, escrow_id: u64) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        Self::extend_escrow_ttl(&env, escrow_id);
        if Self::is_paused(&env) {
            panic!("Contract is paused");
        }

        Self::with_reentrancy_guard(&env, || {
            let status: u32 = env
                .storage()
                .persistent()
                .get(&(escrow_id, symbol_short!("status")))
                .expect("Escrow not found");

            if status != STATUS_PENDING {
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

            let client = token::Client::new(&env, &token);
            client.transfer(&env.current_contract_address(), &receiver, &amount);

            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("status")), &STATUS_RELEASED);
            Self::remove_escrow_data(&env, escrow_id);

            env.events().publish(
                (TOPIC_ESCROW_RELEASED,),
                (escrow_id, receiver, amount),
            );
        });
    }

    pub fn refund_funds(env: Env, admin: Address, escrow_id: u64) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        Self::extend_escrow_ttl(&env, escrow_id);
        if Self::is_paused(&env) {
            panic!("Contract is paused");
        }

        Self::with_reentrancy_guard(&env, || {
            let status: u32 = env
                .storage()
                .persistent()
                .get(&(escrow_id, symbol_short!("status")))
                .expect("Escrow not found");

            if status != STATUS_PENDING {
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

            let client = token::Client::new(&env, &token);
            client.transfer(&env.current_contract_address(), &sender, &amount);

            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("status")), &STATUS_REFUNDED);
            Self::remove_escrow_data(&env, escrow_id);

            env.events()
                .publish((TOPIC_ESCROW_REFUNDED,), (escrow_id, sender, amount));
        });
    }

    pub fn expire_escrow(env: Env, admin: Address, escrow_id: u64) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        Self::extend_escrow_ttl(&env, escrow_id);
        if Self::is_paused(&env) {
            panic!("Contract is paused");
        }

        Self::with_reentrancy_guard(&env, || {
            let status: u32 = env
                .storage()
                .persistent()
                .get(&(escrow_id, symbol_short!("status")))
                .expect("Escrow not found");

            if status != STATUS_PENDING {
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

            let client = token::Client::new(&env, &token);
            client.transfer(&env.current_contract_address(), &sender, &amount);

            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("status")), &STATUS_EXPIRED);
            Self::remove_escrow_data(&env, escrow_id);
        });
    }

    pub fn expire_old_escrows(env: Env, admin: Address, max_age_seconds: u64) -> u64 {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        let now = env.ledger().timestamp();
        let cutoff = now.saturating_sub(max_age_seconds);
        let next_id: u64 = env
            .storage()
            .persistent()
            .get(&symbol_short!("next_id"))
            .unwrap_or(0u64);
        let mut expired_count = 0u64;

        for escrow_id in 0..next_id {
            let status: u32 = env
                .storage()
                .persistent()
                .get(&(escrow_id, symbol_short!("status")))
                .unwrap_or(u32::MAX);
            if status != STATUS_PENDING {
                continue;
            }
            let created_at: u64 = env
                .storage()
                .persistent()
                .get(&(escrow_id, symbol_short!("created_at")))
                .unwrap_or(0u64);
            if created_at < cutoff {
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
                let client = token::Client::new(&env, &token);
                client.transfer(&env.current_contract_address(), &sender, &amount);
                env.storage()
                    .persistent()
                    .set(&(escrow_id, symbol_short!("status")), &STATUS_EXPIRED);
                Self::remove_escrow_data(&env, escrow_id);
                expired_count += 1;
            }
        }
        expired_count
    }

    pub fn batch_create_escrows(
        env: Env,
        sender: Address,
        receivers: Vec<Address>,
        token: Address,
        amounts: Vec<i128>,
    ) -> Vec<u64> {
        sender.require_auth();
        Self::ensure_initialized(&env);
        if Self::is_paused(&env) {
            panic!("Contract is paused");
        }
        if receivers.len() != amounts.len() {
            panic!("Receivers and amounts length mismatch");
        }
        let mut ids = Vec::from_array(&env, &[]);
        for i in 0..receivers.len() {
            let amount = amounts.get_unchecked(i);
            if *amount <= 0 || *amount < MIN_AMOUNT || *amount > MAX_AMOUNT {
                panic!("Amount must be between MIN_AMOUNT and MAX_AMOUNT");
            }
            let client = token::Client::new(&env, &token);
            client.transfer(&sender, env.current_contract_address(), amount);
            let escrow_id: u64 = env
                .storage()
                .persistent()
                .get(&symbol_short!("next_id"))
                .unwrap_or(0u64);
            let next_id = escrow_id + 1;
            env.storage()
                .persistent()
                .set(&symbol_short!("next_id"), &next_id);
            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("sender")), &sender);
            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("receiver")), receivers.get_unchecked(i));
            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("token")), &token);
            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("amount")), amount);
            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("status")), &STATUS_PENDING);
            env.storage()
                .persistent()
                .set(&(escrow_id, symbol_short!("created_at")), &env.ledger().timestamp());
            Self::extend_escrow_ttl(&env, escrow_id);
            Self::extend_next_id_ttl(&env);
            env.events().publish(
                (TOPIC_ESCROW_CREATED,),
                (escrow_id, sender, *receivers.get_unchecked(i), token, *amount),
            );
            ids.push_back(escrow_id);
        }
        ids
    }

    pub fn batch_release_funds(env: Env, admin: Address, escrow_ids: Vec<u64>) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        if Self::is_paused(&env) {
            panic!("Contract is paused");
        }
        for i in 0..escrow_ids.len() {
            let escrow_id = *escrow_ids.get_unchecked(i);
            Self::extend_escrow_ttl(&env, escrow_id);
            Self::with_reentrancy_guard(&env, || {
                let status: u32 = env
                    .storage()
                    .persistent()
                    .get(&(escrow_id, symbol_short!("status")))
                    .expect("Escrow not found");
                if status != STATUS_PENDING {
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
                let client = token::Client::new(&env, &token);
                client.transfer(&env.current_contract_address(), &receiver, &amount);
                env.storage()
                    .persistent()
                    .set(&(escrow_id, symbol_short!("status")), &STATUS_RELEASED);
                Self::remove_escrow_data(&env, escrow_id);
                env.events().publish(
                    (TOPIC_ESCROW_RELEASED,),
                    (escrow_id, receiver, amount),
                );
            });
        }
    }

    pub fn batch_refund_funds(env: Env, admin: Address, escrow_ids: Vec<u64>) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        if Self::is_paused(&env) {
            panic!("Contract is paused");
        }
        for i in 0..escrow_ids.len() {
            let escrow_id = *escrow_ids.get_unchecked(i);
            Self::extend_escrow_ttl(&env, escrow_id);
            Self::with_reentrancy_guard(&env, || {
                let status: u32 = env
                    .storage()
                    .persistent()
                    .get(&(escrow_id, symbol_short!("status")))
                    .expect("Escrow not found");
                if status != STATUS_PENDING {
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
                let client = token::Client::new(&env, &token);
                client.transfer(&env.current_contract_address(), &sender, &amount);
                env.storage()
                    .persistent()
                    .set(&(escrow_id, symbol_short!("status")), &STATUS_REFUNDED);
                Self::remove_escrow_data(&env, escrow_id);
                env.events()
                    .publish((TOPIC_ESCROW_REFUNDED,), (escrow_id, sender, amount));
            });
        }
    }

    pub fn get_escrow_status(env: Env, escrow_id: u64) -> u32 {
        let status: u32 = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("status")))
            .unwrap_or(u32::MAX);
        status
    }

    pub fn get_escrow_details(env: Env, escrow_id: u64) -> (Address, Address, Address, i128, u32, u64) {
        let sender: Address = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("sender")))
            .expect("Escrow not found");
        let receiver: Address = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("receiver")))
            .expect("Escrow not found");
        let token: Address = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("token")))
            .expect("Escrow not found");
        let amount: i128 = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("amount")))
            .expect("Amount not found");
        let status: u32 = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("status")))
            .unwrap_or(u32::MAX);
        let created_at: u64 = env
            .storage()
            .persistent()
            .get(&(escrow_id, symbol_short!("created_at")))
            .unwrap_or(0u64);
        (sender, receiver, token, amount, status, created_at)
    }

    pub fn get_version(_env: Env) -> u32 {
        CONTRACT_VERSION
    }

    pub fn contract_name(_env: Env) -> Symbol {
        Symbol::short("EscrowContract")
    }

    pub fn contract_description(_env: Env) -> Symbol {
        Symbol::short("Secure escrow for cross-border remittances")
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
            symbol_short!("created_at"),
        ] {
            env.storage().persistent().extend_ttl(
                &(escrow_id, field),
                PERSISTENT_TTL_THRESHOLD,
                PERSISTENT_TTL_EXTEND_TO,
            );
        }
    }

    fn remove_escrow_data(env: &Env, escrow_id: u64) {
        for field in [
            symbol_short!("sender"),
            symbol_short!("receiver"),
            symbol_short!("token"),
            symbol_short!("amount"),
            symbol_short!("status"),
            symbol_short!("created_at"),
        ] {
            env.storage().persistent().remove(&(escrow_id, field));
        }
    }

    fn with_reentrancy_guard(env: &Env, f: impl FnOnce()) {
        let guard_key = symbol_short!("reentrancy_guard");
        if env.storage().instance().has(&guard_key) {
            panic!("Reentrancy detected");
        }
        env.storage().instance().set(&guard_key, &true);
        f();
        env.storage().instance().remove(&guard_key);
    }
}

#[cfg(test)]
mod test;
