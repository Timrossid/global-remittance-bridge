#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env,
};

fn setup_token(env: &Env, admin: &Address) -> Address {
    env.register_stellar_asset_contract_v2(admin.clone()).address()
}

#[test]
fn create_escrow_locks_tokens_and_records_pending_id() {
    let env = Env::default();
    env.mock_all_auths();

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &1_000);

    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &600);
    let balances = TokenClient::new(&env, &token);

    assert_eq!(escrow_id, 0);
    assert_eq!(balances.balance(&sender), 400);
    assert_eq!(balances.balance(&contract_id), 600);
}

#[test]
fn release_transfers_tokens_and_prevents_second_release() {
    let env = Env::default();
    env.mock_all_auths();

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &500);

    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &500);
    let balances = TokenClient::new(&env, &token);

    escrow.release_funds(&admin, &escrow_id);

    assert_eq!(balances.balance(&contract_id), 0);
    assert_eq!(balances.balance(&receiver), 500);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        escrow.release_funds(&admin, &escrow_id);
    }))
    .is_err());
}

#[test]
fn refund_returns_tokens_to_sender_and_prevents_second_refund() {
    let env = Env::default();
    env.mock_all_auths();

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &750);

    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &750);
    let balances = TokenClient::new(&env, &token);

    escrow.refund_funds(&admin, &escrow_id);

    assert_eq!(balances.balance(&contract_id), 0);
    assert_eq!(balances.balance(&sender), 750);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        escrow.refund_funds(&admin, &escrow_id);
    }))
    .is_err());
}
