import * as StellarSdk from '@stellar/stellar-sdk';

async function test() {
  // @ts-ignore
  const builder = new StellarSdk.TransactionBuilder('AAAAAAAZS97S567890123456789012345678901234567890123456789012345678901234567890', { fee: 1000 });
  console.log('TransactionBuilder prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(builder)));
}

test();
