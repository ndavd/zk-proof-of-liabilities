use ::poseidon::poseidon;

global DEPTH: u32 = 20;

fn main(
    path_indices: [u1; DEPTH],
    sibling_hashes: [Field; DEPTH],
    sibling_balances: [Field; DEPTH],
    root_hash: pub Field,
    root_balance: pub Field,
    leaf_hash: pub Field,
    leaf_balance: Field,
) {
    let mut node = leaf_hash;
    let mut balance = leaf_balance;
    for i in 0..DEPTH {
        let (balance_left, hash_left, balance_right, hash_right) = if path_indices[i] == 1 {
            (sibling_balances[i], sibling_hashes[i], balance, node)
        } else {
            (balance, node, sibling_balances[i], sibling_hashes[i])
        };
        node = poseidon::bn254::hash_4([balance_left, hash_left, balance_right, hash_right]);
        balance = balance_left + balance_right;
    }
    assert_eq(node, root_hash);
    assert_eq(balance, root_balance);
}
