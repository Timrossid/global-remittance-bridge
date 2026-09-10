#![cfg(test)]
extern crate std;
use super::*;
use soroban_sdk::{
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    token::{StellarAssetClient, TokenClient},
    Address, Env, IntoVal,
};
fn setup_token(env: &Env, admin: &Address) -> Address {
    env.register_stellar_asset_contract_v2(admin.clone()).address()
}
#[test]
fn initialization_requires_admin_authentication() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.initialize(&admin))).is_err());
}
#[test]
fn create_escrow_requires_initialization_before_accepting_funds() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let token = Address::generate(&env);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.create_escrow(&sender, &receiver, &token, &1))).is_err());
}
#[test]
fn create_escrow_locks_tokens_and_records_pending_id() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &1_000);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.initialize(&Address::generate(&env)))).is_err());
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &600);
    let balances = TokenClient::new(&env, &token);
    assert_eq!(escrow_id, 0);
    assert_eq!(balances.balance(&sender), 400);
    assert_eq!(balances.balance(&contract_id), 600);
}
#[test]
fn transfer_admin_requires_the_new_admin_to_authenticate() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let new_admin = Address::generate(&env);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.mock_auths(&[MockAuth { address: &admin, invoke: &MockAuthInvoke { contract: &contract_id, fn_name: "initialize", args: (&admin,).into_val(&env), sub_invokes: &[] } }]);
    escrow.initialize(&admin);
    escrow.mock_auths(&[MockAuth { address: &admin, invoke: &MockAuthInvoke { contract: &contract_id, fn_name: "transfer_admin", args: (&admin, &new_admin).into_val(&env), sub_invokes: &[] } }]);
    escrow.transfer_admin(&admin, &new_admin);
}
#[test]
fn admin_can_transfer_control_and_old_admin_is_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let new_admin = Address::generate(&env);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    escrow.transfer_admin(&admin, &new_admin);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.transfer_admin(&admin, &Address::generate(&env)))).is_err());
    escrow.transfer_admin(&new_admin, &admin);
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
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &500);
    let balances = TokenClient::new(&env, &token);
    escrow.release_funds(&admin, &escrow_id);
    assert_eq!(balances.balance(&contract_id), 0);
    assert_eq!(balances.balance(&receiver), 500);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.release_funds(&admin, &escrow_id))).is_err());
}
#[test]
fn rejects_a_non_admin_even_when_the_address_is_authenticated() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let wrong_admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &100);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &100);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.release_funds(&wrong_admin, &escrow_id))).is_err());
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
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &750);
    let balances = TokenClient::new(&env, &token);
    escrow.refund_funds(&admin, &escrow_id);
    assert_eq!(balances.balance(&contract_id), 0);
    assert_eq!(balances.balance(&sender), 750);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.refund_funds(&admin, &escrow_id))).is_err());
}
#[test]
fn get_version_returns_contract_version() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    assert_eq!(escrow.get_version(), 1);
}
#[test]
fn get_escrow_status_returns_pending_after_creation() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &100);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &100);
    assert_eq!(escrow.get_escrow_status(escrow_id), 0);
}
#[test]
fn expire_escrow_returns_funds_to_sender() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &200);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &200);
    let balances = TokenClient::new(&env, &token);
    escrow.expire_escrow(&admin, &escrow_id);
    assert_eq!(escrow.get_escrow_status(escrow_id), 3);
    assert_eq!(balances.balance(&sender), 200);
}
#[test]
fn pause_blocks_state_changes_and_unpause_resumes() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &1_000);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    escrow.pause(&admin);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.create_escrow(&sender, &receiver, &token, &1))).is_err());
    escrow.unpause(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &1);
    assert_eq!(escrow.get_escrow_status(escrow_id), 0);
}
#[test]
fn batch_create_escrows_creates_multiple_escrows() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver1 = Address::generate(&env);
    let receiver2 = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &2_000);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let receivers = Vec::from_array(&env, &[receiver1.clone(), receiver2.clone()]);
    let amounts = Vec::from_array(&env, &[100i128, 200i128]);
    let ids = escrow.batch_create_escrows(&sender, &receivers, &token, &amounts);
    assert_eq!(ids.len(), 2);
    assert_eq!(ids.get_unchecked(0), 0);
    assert_eq!(ids.get_unchecked(1), 1);
}
#[test]
fn batch_release_funds_releases_multiple_escrows() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver1 = Address::generate(&env);
    let receiver2 = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &1_000);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let receivers = Vec::from_array(&env, &[receiver1.clone(), receiver2.clone()]);
    let amounts = Vec::from_array(&env, &[100i128, 200i128]);
    let ids = escrow.batch_create_escrows(&sender, &receivers, &token, &amounts);
    escrow.batch_release_funds(&admin, &ids);
    let balances = TokenClient::new(&env, &token);
    assert_eq!(balances.balance(&receiver1), 100);
    assert_eq!(balances.balance(&receiver2), 200);
}
#[test]
fn batch_refund_funds_refunds_multiple_escrows() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver1 = Address::generate(&env);
    let receiver2 = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &1_000);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let receivers = Vec::from_array(&env, &[receiver1.clone(), receiver2.clone()]);
    let amounts = Vec::from_array(&env, &[100i128, 200i128]);
    let ids = escrow.batch_create_escrows(&sender, &receivers, &token, &amounts);
    escrow.batch_refund_funds(&admin, &ids);
    let balances = TokenClient::new(&env, &token);
    assert_eq!(balances.balance(&sender), 300);
}
#[test]
fn get_escrow_details_returns_recorded_fields() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &1_000);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &250);
    let details = escrow.get_escrow_details(escrow_id);
    assert_eq!(details.0, sender);
    assert_eq!(details.1, receiver);
    assert_eq!(details.2, token);
    assert_eq!(details.3, 250);
    assert_eq!(details.4, 0);
}
#[test]
fn contract_metadata_is_exposed() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    assert_eq!(escrow.contract_name(), Symbol::short("EscrowContract"));
    assert_eq!(
        escrow.contract_description(),
        Symbol::short("Secure escrow for cross-border remittances")
    );
}
#[test]
fn full_lifecycle_create_release_and_verify_cleanup() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &1_500);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &1_000);
    assert_eq!(escrow.get_escrow_status(escrow_id), 0);
    escrow.release_funds(&admin, &escrow_id);
    assert_eq!(escrow.get_escrow_status(escrow_id), 3);
    let balances = TokenClient::new(&env, &token);
    assert_eq!(balances.balance(&contract_id), 0);
    assert_eq!(balances.balance(&receiver), 1_000);
}
#[test]
fn expire_old_escrows_refunds_stale_entries() {
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
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &500);
    let expired = escrow.expire_old_escrows(&admin, &1);
    assert_eq!(expired, 1);
    assert_eq!(escrow.get_escrow_status(escrow_id), 3);
}
#[test]
fn reentrancy_guard_blocks_recursive_calls() {
    let env = Env::default();
    env.mock_all_auths();
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = setup_token(&env, &token_admin);
    StellarAssetClient::new(&env, &token).mint(&sender, &100);
    let contract_id = env.register(EscrowContract, ());
    let escrow = EscrowContractClient::new(&env, &contract_id);
    escrow.initialize(&admin);
    let escrow_id = escrow.create_escrow(&sender, &receiver, &token, &100);
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.release_funds(&admin, &escrow_id))).is_ok());
    assert!(std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| escrow.release_funds(&admin, &escrow_id))).is_err());
}
