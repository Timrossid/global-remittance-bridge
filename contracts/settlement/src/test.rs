#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env,
};

fn setup_token(env: &Env, admin: &Address) -> Address {
    env.register_stellar_asset_contract_v2(admin.clone())
        .address()
}

#[test]
fn process_settlement_splits_net_amount_and_protocol_fee() {
    let env = Env::default();
    env.mock_all_auths();

    let sender = Address::generate(&env);
    let merchant = Address::generate(&env);
    let treasury = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &10_000);

    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);
    settlement.process_settlement(&sender, &merchant, &treasury, &token, &10_000);
    let balances = TokenClient::new(&env, &token);

    assert_eq!(balances.balance(&sender), 0);
    assert_eq!(balances.balance(&merchant), 9_950);
    assert_eq!(balances.balance(&treasury), 50);
    assert_eq!(settlement.get_last_settlement(), (10_000, 9_950, 50));
    assert_eq!(settlement.get_fee_bps(), 50);
}

#[test]
fn initialize_is_one_time_and_distribute_fees_requires_registered_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let other_admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);

    settlement.initialize(&admin);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        settlement.initialize(&other_admin);
    }))
    .is_err());

    StellarAssetClient::new(&env, &token).mint(&contract_id, &125);
    settlement.distribute_fees(&admin, &treasury, &token, &125);

    let balances = TokenClient::new(&env, &token);
    assert_eq!(balances.balance(&contract_id), 0);
    assert_eq!(balances.balance(&treasury), 125);

    StellarAssetClient::new(&env, &token).mint(&contract_id, &25);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        settlement.distribute_fees(&other_admin, &treasury, &token, &25);
    }))
    .is_err());
}

#[test]
fn process_settlement_rejects_non_positive_amounts() {
    let env = Env::default();
    env.mock_all_auths();

    let sender = Address::generate(&env);
    let merchant = Address::generate(&env);
    let treasury = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);

    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        settlement.process_settlement(&sender, &merchant, &treasury, &token, &0);
    }))
    .is_err());
}
