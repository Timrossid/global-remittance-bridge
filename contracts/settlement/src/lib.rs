#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env, Symbol, Vec};

const FEE_BPS: i128 = 50;
const BPS_DENOMINATOR: i128 = 10_000;

const TOPIC_SETTLED: Symbol = symbol_short!("settled");
const TOPIC_FEES_DISTRIBUTED: Symbol = symbol_short!("fees_dist");

const SETTLEMENT_VERSION: u32 = 1;
const DEFAULT_THRESHOLD: u32 = 1;

#[contract]
pub struct SettlementContract;

#[contractimpl]
impl SettlementContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Already initialized");
        }
        admin.require_auth();

        let mut admins = Vec::from_array(&env, &[admin.clone()]);
        env.storage()
            .instance()
            .set(&symbol_short!("admin"), &admins);

        env.storage()
            .instance()
            .set(&symbol_short!("threshold"), &DEFAULT_THRESHOLD);
        env.storage()
            .instance()
            .set(&symbol_short!("version"), &SETTLEMENT_VERSION);

        env.events().publish((Symbol::short("init"),), admin);
    }

    pub fn add_admin(env: Env, caller: Address, new_admin: Address) {
        caller.require_auth();
        Self::require_admin(&env, &caller);

        let mut admins: Vec<Address> = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .expect("Contract not initialized");
        admins.push_back(new_admin.clone());
        env.storage()
            .instance()
            .set(&symbol_short!("admin"), &admins);

        env.events().publish(
            (Symbol::short("admin_added"),),
            (caller, new_admin),
        );
    }

    pub fn process_settlement(
        env: Env,
        caller: Address,
        merchant: Address,
        treasury: Address,
        token: Address,
        amount: i128,
    ) {
        Self::require_authorized_caller(&env, &caller);

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        let fee = (amount * FEE_BPS) / BPS_DENOMINATOR;
        let net = amount - fee;

        let client = token::Client::new(&env, &token);
        client.transfer(&caller, &merchant, &net);

        if fee > 0 {
            client.transfer(&caller, &treasury, &fee);
        }

        env.storage()
            .instance()
            .set(&symbol_short!("last_amt"), &amount);
        env.storage()
            .instance()
            .set(&symbol_short!("last_net"), &net);
        env.storage()
            .instance()
            .set(&symbol_short!("last_fee"), &fee);

        env.events().publish(
            (TOPIC_SETTLED,),
            (caller, merchant, treasury, token, amount, net, fee),
        );
    }

    pub fn distribute_fees(
        env: Env,
        admin: Address,
        treasury: Address,
        token: Address,
        fee_amount: i128,
    ) {
        admin.require_auth();
        Self::require_admin(&env, &admin);

        if fee_amount <= 0 {
            panic!("Fee amount must be positive");
        }

        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &treasury, &fee_amount);

        env.events()
            .publish((TOPIC_FEES_DISTRIBUTED,), (admin, treasury, fee_amount));
    }

    pub fn get_last_settlement(env: Env) -> (i128, i128, i128) {
        let amount: i128 = env
            .storage()
            .instance()
            .get(&symbol_short!("last_amt"))
            .unwrap_or(0);
        let net: i128 = env
            .storage()
            .instance()
            .get(&symbol_short!("last_net"))
            .unwrap_or(0);
        let fee: i128 = env
            .storage()
            .instance()
            .get(&symbol_short!("last_fee"))
            .unwrap_or(0);
        (amount, net, fee)
    }

    pub fn get_fee_bps(_env: Env) -> i128 {
        FEE_BPS
    }

    pub fn get_version(_env: Env) -> u32 {
        SETTLEMENT_VERSION
    }

    fn require_admin(env: &Env, admin: &Address) {
        Self::require_authorized_caller(env, admin);
    }

    fn require_authorized_caller(env: &Env, caller: &Address) {
        if !env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Contract not initialized");
        }
        let admins: Vec<Address> = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .expect("Contract not initialized");
        let mut found = false;
        for i in 0..admins.len() {
            if caller == &admins.get_unchecked(i) {
                found = true;
                break;
            }
        }
        if !found {
            panic!("Unauthorized: caller is not a registered admin");
        }
    }
}

#[cfg(test)]
mod test;
