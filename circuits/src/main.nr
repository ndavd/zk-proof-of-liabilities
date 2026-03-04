use ::poseidon::poseidon2;

trait MerkleSumTreeHasher {
    fn hash_node(
        balance_left: Field,
        hash_left: Field,
        balance_right: Field,
        hash_right: Field,
    ) -> Field;

    fn hash_leaf(id: Field, balance: Field) -> Field;
}

fn assert_inclusion<let DEPTH: u32, let MAX_BALANCE_BITS: u32, let FIELD_BITS: u32, H>(
    path_indices: [u1; DEPTH],
    sibling_hashes: [Field; DEPTH],
    sibling_balances: [Field; DEPTH],
    root_hash: Field,
    root_balance: Field,
    leaf_hash: Field,
    leaf_balance: Field,
    leaf_id: Field,
)
where
    H: MerkleSumTreeHasher,
{
    assert_constant(MAX_BALANCE_BITS + 1 < FIELD_BITS);

    assert_eq(leaf_hash, H::hash_leaf(leaf_id, leaf_balance));

    let mut node = leaf_hash;

    let mut balance = leaf_balance;
    balance.assert_max_bit_size::<MAX_BALANCE_BITS>();

    for i in 0..DEPTH {
        sibling_balances[i].assert_max_bit_size::<MAX_BALANCE_BITS>();
        let (balance_left, hash_left, balance_right, hash_right) = if path_indices[i] == 1 {
            (sibling_balances[i], sibling_hashes[i], balance, node)
        } else {
            (balance, node, sibling_balances[i], sibling_hashes[i])
        };
        node = H::hash_node(balance_left, hash_left, balance_right, hash_right);
        balance = balance_left + balance_right;
        balance.assert_max_bit_size::<MAX_BALANCE_BITS>();
    }

    assert_eq(node, root_hash);
    assert_eq(balance, root_balance);
}

global DEPTH: u32 = 20;
global MAX_BALANCE_BITS: u32 = 128;

struct PoseidonHasher;
impl MerkleSumTreeHasher for PoseidonHasher {
    fn hash_node(
        balance_left: Field,
        hash_left: Field,
        balance_right: Field,
        hash_right: Field,
    ) -> Field {
        poseidon2::Poseidon2::hash([balance_left, hash_left, balance_right, hash_right], 4)
    }

    fn hash_leaf(id: Field, balance: Field) -> Field {
        poseidon2::Poseidon2::hash([id, balance], 2)
    }
}

fn main(
    path_indices: [u1; DEPTH],
    sibling_hashes: [Field; DEPTH],
    sibling_balances: [Field; DEPTH],
    root_hash: pub Field,
    root_balance: pub Field,
    leaf_hash: pub Field,
    leaf_balance: Field,
    leaf_id: Field,
) {
    assert_inclusion::<_, MAX_BALANCE_BITS, 254, PoseidonHasher>(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        leaf_hash,
        leaf_balance,
        leaf_id,
    );
}
