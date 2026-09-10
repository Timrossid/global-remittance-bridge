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

#[test]
fn get_version_returns_contract_version() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);
    settlement.initialize(&admin);
    assert_eq!(settlement.get_version(), 1);
}

#[test]
fn add_admin_extends_authorized_callers() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let second_admin = Address::generate(&env);
    let merchant = Address::generate(&env);
    let treasury = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);

    settlement.initialize(&admin);
    settlement.add_admin(&admin, &second_admin);

    StellarAssetClient::new(&env, &token).mint(&second_admin, &10_000);
    settlement.process_settlement(&second_admin, &merchant, &treasury, &token, &10_000);
    let balances = TokenClient::new(&env, &token);
    assert_eq!(balances.balance(&merchant), 9_950);
    assert_eq!(balances.balance(&treasury), 50);
}

#[test]
fn pause_blocks_settlements_and_unpause_resumes() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let merchant = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);
    settlement.initialize(&admin);
    settlement.pause(&admin);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        settlement.process_settlement(&sender, &merchant, &treasury, &token, &1_000);
    }))
    .is_err());
    settlement.unpause(&admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &1_000);
    settlement.process_settlement(&sender, &merchant, &treasury, &token, &1_000);
    let balances = TokenClient::new(&env, &token);
    assert_eq!(balances.balance(&merchant), 950);
}

#[test]
fn batch_settle_processes_multiple_merchants() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let merchant1 = Address::generate(&env);
    let merchant2 = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);
    settlement.initialize(&admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &20_000);
    let merchants = Vec::from_array(&env, &[merchant1.clone(), merchant2.clone()]);
    let amounts = Vec::from_array(&env, &[10_000i128, 5_000i128]);
    settlement.batch_settle(&sender, &merchants, &treasury, &token, &amounts);
    let balances = TokenClient::new(&env, &token);
    assert_eq!(balances.balance(&merchant1), 9_950);
    assert_eq!(balances.balance(&merchant2), 4_975);
    assert_eq!(balances.balance(&treasury), 75);
}

#[test]
fn distribute_fees_rejects_non_positive_amounts() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);
    settlement.initialize(&admin);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        settlement.distribute_fees(&admin, &treasury, &token, &0);
    }))
    .is_err());
}

#[test]
fn process_settlement_rejects_amounts_outside_bounds() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let merchant = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);
    settlement.initialize(&admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &10_000);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        settlement.process_settlement(&sender, &merchant, &treasury, &token, &0);
    }))
    .is_err());
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        settlement.process_settlement(&sender, &merchant, &treasury, &token, &2_000_000_000_001);
    }))
    .is_err());
}

#[test]
fn contract_name_and_description_expose_metadata() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &contract_id);
    settlement.initialize(&admin);
    assert_eq!(settlement.contract_name(), Symbol::short("SettlementContract"));
    assert_eq!(
        settlement.contract_description(),
        Symbol::short("Settlement and fee distribution for remittances")
    );
}
