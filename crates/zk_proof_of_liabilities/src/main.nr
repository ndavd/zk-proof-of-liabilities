use ::merkle_sum_tree::{assert_inclusion, MerkleSumTreeHasher};
use ::poseidon::poseidon2;

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
