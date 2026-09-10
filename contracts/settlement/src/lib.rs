#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env, Symbol};

const FEE_BPS: i128 = 50;
const BPS_DENOMINATOR: i128 = 10_000;

const TOPIC_SETTLED: Symbol = symbol_short!("settled");
const TOPIC_FEES_DISTRIBUTED: Symbol = symbol_short!("fees_dist");

#[contract]
pub struct SettlementContract;

#[contractimpl]
impl SettlementContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage()
            .instance()
            .set(&symbol_short!("admin"), &admin);
        env.events().publish((Symbol::short("init"),), admin);
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

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .expect("Contract not initialized — call initialize first");

        if admin != stored_admin {
            panic!("Unauthorized: caller is not the registered admin");
        }

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

    fn require_authorized_caller(env: &Env, caller: &Address) {
        if !env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Contract not initialized");
        }
        let admin: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .expect("Contract not initialized");
        if caller != &admin {
            panic!("Unauthorized: caller is not the registered admin");
        }
    }
}

#[cfg(test)]
mod test;
