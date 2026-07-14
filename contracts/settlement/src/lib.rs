#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, symbol_short, token};

/// Protocol fee basis points: 50 = 0.5%
const FEE_BPS: i128 = 50;
const BPS_DENOMINATOR: i128 = 10_000;

#[contract]
pub struct SettlementContract;

#[contractimpl]
impl SettlementContract {
    /// Initializes the contract with an admin address (call once after deploy).
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }

    /// Processes a merchant settlement, deducting the protocol fee.
    ///
    /// - `sender`   : account funding this settlement (must sign)
    /// - `merchant` : merchant wallet receiving the net amount
    /// - `treasury` : protocol treasury receiving the 0.5% fee
    /// - `token`    : Soroban token contract address (e.g. USDC)
    /// - `amount`   : gross amount in token stroops
    pub fn process_settlement(
        env: Env,
        sender: Address,
        merchant: Address,
        treasury: Address,
        token: Address,
        amount: i128,
    ) {
        sender.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        let fee = (amount * FEE_BPS) / BPS_DENOMINATOR;
        let net = amount - fee;

        let client = token::Client::new(&env, &token);

        // Transfer net amount to the merchant
        client.transfer(&sender, &merchant, &net);

        // Transfer protocol fee to the treasury
        if fee > 0 {
            client.transfer(&sender, &treasury, &fee);
        }

        // Persist last settlement data for off-chain indexers / view callers
        env.storage().instance().set(&symbol_short!("last_amt"), &amount);
        env.storage().instance().set(&symbol_short!("last_net"), &net);
        env.storage().instance().set(&symbol_short!("last_fee"), &fee);
    }

    /// Distributes protocol fees held by this contract to the treasury.
    /// Only callable by the admin set during `initialize`.
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
    }

    /// Returns (gross_amount, net_amount, fee) from the last settlement.
    pub fn get_last_settlement(env: Env) -> (i128, i128, i128) {
        let amount: i128 = env.storage().instance().get(&symbol_short!("last_amt")).unwrap_or(0);
        let net: i128 = env.storage().instance().get(&symbol_short!("last_net")).unwrap_or(0);
        let fee: i128 = env.storage().instance().get(&symbol_short!("last_fee")).unwrap_or(0);
        (amount, net, fee)
    }

    /// Returns the current fee rate in basis points (50 = 0.5%).
    pub fn get_fee_bps(_env: Env) -> i128 {
        FEE_BPS
    }
}
