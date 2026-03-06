use ::merkle_sum_tree::{assert_inclusion, MerkleSumTreeHasher};
use ::poseidon::poseidon2;

/// The maximum number of users is 2^20 = 1048576
global DEPTH: u32 = 20;
/// The biggest allowed balance is 2^128 - 1 = 340282366920938463463374607431768211455
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
    user_hash: pub Field,
    user_balance: Field,
    user_id: Field,
) {
    assert_inclusion::<_, MAX_BALANCE_BITS, 254, PoseidonHasher>(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    );
}

#[test]
/// Generated using `bun run generate-prover-toml mock-data/users.csv Alice`
fn mock_valid_alice_inputs() -> ([u1; DEPTH], [Field; DEPTH], [Field; DEPTH], Field, Field, Field, Field, Field) {
    let path_indices = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let sibling_hashes = [
        0x1cafaf9d983770f0ce1828e3e3a5afb9551613fe9816bb5870e2fa216dd79299,
        0x2ac7cfc12ebe0b3c4e46071cbfa38ec554cae41a17cda696e375fb106e441350,
        0x23a02adc899fba69db7c7b68df1b427ad562ae8e2f69d3a0a9b865d68d926405,
        0x208e62e99c5152fc299bb62758183375bfd0000faf06de9a98d02df93eb193ee,
        0x18b1cb20fe3d032a4fa03aa1b967371ef01a7b0f431786c75ea99214f7c166fa,
        0xe9db4e78129dfcabd6858a72c24e222c6a252b99bbd0964b6a2c9cd4a0779f6,
        0x2b127322e8382159dbfd411e3a4a6298ce321e187f7cb9fe9976acb824a4fe68,
        0x385164f4236335e5257500c10de3daa98cf98fd4cd4daecd013f732f456fbfd,
        0xd1ba6f2e4131b036481ee82271ac68ca9771257e6c8fb9a456df239533871a2,
        0x11b0192f04eb1239cb27febed56102d3a17de3c3888e6ba760dc6a4896dcdecd,
        0x15d0b301af36495436c359c433bae21bc2d1c2d9f3da10d9e12d7f89714630ae,
        0x10bf7e8f0988d53ccb434776e204512b676fd9aa5f392f24c514744493da7371,
        0x28d8bcc40f107cfbb86826bb8f9aa8ba27df4b18b4bed3e1a6ce1805a2645be9,
        0xa605eb730428720b172e62cda5cd27f4243889d6127cd3e5a3de3d4f8b3ef4,
        0x189f12167057a5ff1ed196bc3a6bea03faa6b34b44cbbbb0584d8b9a20dae678,
        0xfbf6d8484dbddd276fc102c2b5983e789536a4e029cd77c048ba556260cddc,
        0x2e53a6cfc3e78a52df692eb9cae2d71e148557cb3e510ac5343ce39c28558f2,
        0x2281091c138064331a437b57e65d24a7ad059c398c01c6dd52f3f3fea811aee2,
        0x1c216fda2aba25efb343f94ba888a774b041e1982c0d95f5f06844f82e9003d3,
        0x1edb9708f3a6965f8520372b9aa3c4da4bb9d93f5dd9bd8f711418f9b5491f0f,
    ];
    let sibling_balances =
        [6395, 18851, 82821, 162804, 106404, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let root_hash = 0x2435ee3269bda147ae3f77afec5380a3bf7150139f6e179b81900cdc439e7436;
    let root_balance = 397559;
    let user_hash = 0x2abca1526ee7d8fb15d69e4a889dfc8677fc5900e2bfdab802c9722f782ac77a;
    let user_balance = 20284;
    let user_id = 0x1ec0c7fb4c8e03c9ad47c3bdb7772dd94d1e7b12b6b0ac15a7d7608d5399880f;
    (
        path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash,
        user_balance, user_id,
    )
}

#[test]
/// Generated using `bun run generate-prover-toml mock-data/users-single-128overflow.csv Alice`
fn mock_128overflow_alice_inputs() -> ([u1; DEPTH], [Field; DEPTH], [Field; DEPTH], Field, Field, Field, Field, Field) {
    let path_indices = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let sibling_hashes = [
        0x1cafaf9d983770f0ce1828e3e3a5afb9551613fe9816bb5870e2fa216dd79299,
        0x2ac7cfc12ebe0b3c4e46071cbfa38ec554cae41a17cda696e375fb106e441350,
        0x23a02adc899fba69db7c7b68df1b427ad562ae8e2f69d3a0a9b865d68d926405,
        0x208e62e99c5152fc299bb62758183375bfd0000faf06de9a98d02df93eb193ee,
        0x18b1cb20fe3d032a4fa03aa1b967371ef01a7b0f431786c75ea99214f7c166fa,
        0xe9db4e78129dfcabd6858a72c24e222c6a252b99bbd0964b6a2c9cd4a0779f6,
        0x2b127322e8382159dbfd411e3a4a6298ce321e187f7cb9fe9976acb824a4fe68,
        0x385164f4236335e5257500c10de3daa98cf98fd4cd4daecd013f732f456fbfd,
        0xd1ba6f2e4131b036481ee82271ac68ca9771257e6c8fb9a456df239533871a2,
        0x11b0192f04eb1239cb27febed56102d3a17de3c3888e6ba760dc6a4896dcdecd,
        0x15d0b301af36495436c359c433bae21bc2d1c2d9f3da10d9e12d7f89714630ae,
        0x10bf7e8f0988d53ccb434776e204512b676fd9aa5f392f24c514744493da7371,
        0x28d8bcc40f107cfbb86826bb8f9aa8ba27df4b18b4bed3e1a6ce1805a2645be9,
        0xa605eb730428720b172e62cda5cd27f4243889d6127cd3e5a3de3d4f8b3ef4,
        0x189f12167057a5ff1ed196bc3a6bea03faa6b34b44cbbbb0584d8b9a20dae678,
        0xfbf6d8484dbddd276fc102c2b5983e789536a4e029cd77c048ba556260cddc,
        0x2e53a6cfc3e78a52df692eb9cae2d71e148557cb3e510ac5343ce39c28558f2,
        0x2281091c138064331a437b57e65d24a7ad059c398c01c6dd52f3f3fea811aee2,
        0x1c216fda2aba25efb343f94ba888a774b041e1982c0d95f5f06844f82e9003d3,
        0x1edb9708f3a6965f8520372b9aa3c4da4bb9d93f5dd9bd8f711418f9b5491f0f,
    ];
    let sibling_balances =
        [6395, 18851, 82821, 162804, 106404, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let root_hash = 0x8850ff275058f60eb8b2c5958e1ebd73fb9ff90b972f56522357621d2a79f40;
    let root_balance = 340282366920938463463374607431768588731;
    let user_hash = 0x1aa226b0c1880b7cc0469265d541f4870c77206ab1b0f8e776c346bd07ce4a09;
    let user_balance = 340282366920938463463374607431768211456;
    let user_id = 0x1ec0c7fb4c8e03c9ad47c3bdb7772dd94d1e7b12b6b0ac15a7d7608d5399880f;
    (
        path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash,
        user_balance, user_id,
    )
}

#[test]
/// Generated using `bun run generate-prover-toml mock-data/users-single-128overflow.csv Mallory`
/// Proving Mallory but Alice's balance overflows u128
fn mock_128overflow_mallory_sibling_inputs() -> ([u1; DEPTH], [Field; DEPTH], [Field; DEPTH], Field, Field, Field, Field, Field) {
    let path_indices = [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let sibling_hashes = [
        0x201592ae05fb9a6f252faa010af5c73daab92ef574664fc5534995e0f841888c,
        0x23e1d0aa0e74da054d5c270880a7ac01714563ce7abe9c2f1e8b9107e943e6a6,
        0x102343096cf815f82412be4c4e3a7a973399a2bf7960ee486a2524901e95eca9,
        0x208e62e99c5152fc299bb62758183375bfd0000faf06de9a98d02df93eb193ee,
        0x18b1cb20fe3d032a4fa03aa1b967371ef01a7b0f431786c75ea99214f7c166fa,
        0xe9db4e78129dfcabd6858a72c24e222c6a252b99bbd0964b6a2c9cd4a0779f6,
        0x2b127322e8382159dbfd411e3a4a6298ce321e187f7cb9fe9976acb824a4fe68,
        0x385164f4236335e5257500c10de3daa98cf98fd4cd4daecd013f732f456fbfd,
        0xd1ba6f2e4131b036481ee82271ac68ca9771257e6c8fb9a456df239533871a2,
        0x11b0192f04eb1239cb27febed56102d3a17de3c3888e6ba760dc6a4896dcdecd,
        0x15d0b301af36495436c359c433bae21bc2d1c2d9f3da10d9e12d7f89714630ae,
        0x10bf7e8f0988d53ccb434776e204512b676fd9aa5f392f24c514744493da7371,
        0x28d8bcc40f107cfbb86826bb8f9aa8ba27df4b18b4bed3e1a6ce1805a2645be9,
        0xa605eb730428720b172e62cda5cd27f4243889d6127cd3e5a3de3d4f8b3ef4,
        0x189f12167057a5ff1ed196bc3a6bea03faa6b34b44cbbbb0584d8b9a20dae678,
        0xfbf6d8484dbddd276fc102c2b5983e789536a4e029cd77c048ba556260cddc,
        0x2e53a6cfc3e78a52df692eb9cae2d71e148557cb3e510ac5343ce39c28558f2,
        0x2281091c138064331a437b57e65d24a7ad059c398c01c6dd52f3f3fea811aee2,
        0x1c216fda2aba25efb343f94ba888a774b041e1982c0d95f5f06844f82e9003d3,
        0x1edb9708f3a6965f8520372b9aa3c4da4bb9d93f5dd9bd8f711418f9b5491f0f,
    ];
    let sibling_balances = [
        18071,
        35213,
        340282366920938463463374607431768236702,
        162804,
        106404,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
    ];
    let root_hash = 0x8850ff275058f60eb8b2c5958e1ebd73fb9ff90b972f56522357621d2a79f40;
    let root_balance = 340282366920938463463374607431768588731;
    let user_hash = 0x3b9df2c31bf059ad7d7e77a0e35dbc94e7bd71a0088f8642ec07fb51ba1594a;
    let user_balance = 29537;
    let user_id = 0x14ae118f04e256d943eed567dde20cf73c953059880039b1d78b4be2924e656e;
    (
        path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash,
        user_balance, user_id,
    )
}

#[test]
/// Generated using `bun run generate-prover-toml mock-data/users-sum-128overflow.csv Alice`
/// All balances are valid but their sum overflows u128
fn mock_128overflow_sum_alice_inputs() -> ([u1; DEPTH], [Field; DEPTH], [Field; DEPTH], Field, Field, Field, Field, Field) {
    let path_indices = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let sibling_hashes = [
        0x2114fed374bed4cd7726365ea347863936fe6007e43f89bf3e4071c6a370c5a0,
        0x1f9db8544cc82e5886c4fa36be68a80c8f8de1ee5b3d71aeed545c2748fb7cc3,
        0xaee2df996148714f8b8c45597c2b09dfcd4e2c53a98f3bed525e2890f4df4c0,
        0x305309d1458856d017fcedf4d16dacae84724555121251bcb5791b87f7deeef,
        0x2ad88dda379371ddd76fa864fd07d8361216b5122c6d5f3169293e9699abb470,
        0xe9db4e78129dfcabd6858a72c24e222c6a252b99bbd0964b6a2c9cd4a0779f6,
        0x2b127322e8382159dbfd411e3a4a6298ce321e187f7cb9fe9976acb824a4fe68,
        0x385164f4236335e5257500c10de3daa98cf98fd4cd4daecd013f732f456fbfd,
        0xd1ba6f2e4131b036481ee82271ac68ca9771257e6c8fb9a456df239533871a2,
        0x11b0192f04eb1239cb27febed56102d3a17de3c3888e6ba760dc6a4896dcdecd,
        0x15d0b301af36495436c359c433bae21bc2d1c2d9f3da10d9e12d7f89714630ae,
        0x10bf7e8f0988d53ccb434776e204512b676fd9aa5f392f24c514744493da7371,
        0x28d8bcc40f107cfbb86826bb8f9aa8ba27df4b18b4bed3e1a6ce1805a2645be9,
        0xa605eb730428720b172e62cda5cd27f4243889d6127cd3e5a3de3d4f8b3ef4,
        0x189f12167057a5ff1ed196bc3a6bea03faa6b34b44cbbbb0584d8b9a20dae678,
        0xfbf6d8484dbddd276fc102c2b5983e789536a4e029cd77c048ba556260cddc,
        0x2e53a6cfc3e78a52df692eb9cae2d71e148557cb3e510ac5343ce39c28558f2,
        0x2281091c138064331a437b57e65d24a7ad059c398c01c6dd52f3f3fea811aee2,
        0x1c216fda2aba25efb343f94ba888a774b041e1982c0d95f5f06844f82e9003d3,
        0x1edb9708f3a6965f8520372b9aa3c4da4bb9d93f5dd9bd8f711418f9b5491f0f,
    ];
    let sibling_balances = [
        15467380314588111975607936701444009612,
        30934760629176223951215873402888019224,
        61869521258352447902431746805776038448,
        123739042516704895804863493611552076896,
        92804281887528671853647620208664057672,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
    ];
    let root_hash = 0x1a62fa7d03ed6ac4ab84160541f2fbb77338213b1f15d0a960ae59d66cca12b5;
    let root_balance = 340282366920938463463374607431768211464;
    let user_hash = 0x301c97a68271f90118cf8a06ba7ed14f30b928bfe6ec0083c1edc914e663a5f6;
    let user_balance = 15467380314588111975607936701444009612;
    let user_id = 0x1ec0c7fb4c8e03c9ad47c3bdb7772dd94d1e7b12b6b0ac15a7d7608d5399880f;
    (
        path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash,
        user_balance, user_id,
    )
}

#[test]
/// Generated using `bun run generate-prover-toml mock-data/users-negative.csv Alice`
/// Proving Alice but Alice's sibling has a negative balance
fn mock_negative_alice_sibling_inputs() -> ([u1; DEPTH], [Field; DEPTH], [Field; DEPTH], Field, Field, Field, Field, Field) {
    let path_indices = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let sibling_hashes = [
        0x2480b6d84dd5a31eeebfd4f72582917c7766fe92d343b20fd87d637e9f69f807,
        0x2ac7cfc12ebe0b3c4e46071cbfa38ec554cae41a17cda696e375fb106e441350,
        0x23a02adc899fba69db7c7b68df1b427ad562ae8e2f69d3a0a9b865d68d926405,
        0x208e62e99c5152fc299bb62758183375bfd0000faf06de9a98d02df93eb193ee,
        0x18b1cb20fe3d032a4fa03aa1b967371ef01a7b0f431786c75ea99214f7c166fa,
        0xe9db4e78129dfcabd6858a72c24e222c6a252b99bbd0964b6a2c9cd4a0779f6,
        0x2b127322e8382159dbfd411e3a4a6298ce321e187f7cb9fe9976acb824a4fe68,
        0x385164f4236335e5257500c10de3daa98cf98fd4cd4daecd013f732f456fbfd,
        0xd1ba6f2e4131b036481ee82271ac68ca9771257e6c8fb9a456df239533871a2,
        0x11b0192f04eb1239cb27febed56102d3a17de3c3888e6ba760dc6a4896dcdecd,
        0x15d0b301af36495436c359c433bae21bc2d1c2d9f3da10d9e12d7f89714630ae,
        0x10bf7e8f0988d53ccb434776e204512b676fd9aa5f392f24c514744493da7371,
        0x28d8bcc40f107cfbb86826bb8f9aa8ba27df4b18b4bed3e1a6ce1805a2645be9,
        0xa605eb730428720b172e62cda5cd27f4243889d6127cd3e5a3de3d4f8b3ef4,
        0x189f12167057a5ff1ed196bc3a6bea03faa6b34b44cbbbb0584d8b9a20dae678,
        0xfbf6d8484dbddd276fc102c2b5983e789536a4e029cd77c048ba556260cddc,
        0x2e53a6cfc3e78a52df692eb9cae2d71e148557cb3e510ac5343ce39c28558f2,
        0x2281091c138064331a437b57e65d24a7ad059c398c01c6dd52f3f3fea811aee2,
        0x1c216fda2aba25efb343f94ba888a774b041e1982c0d95f5f06844f82e9003d3,
        0x1edb9708f3a6965f8520372b9aa3c4da4bb9d93f5dd9bd8f711418f9b5491f0f,
    ];
    let sibling_balances =
        [-6395, 18851, 82821, 162804, 106404, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let root_hash = 0x396a22601adea6775dd9920533feab43778f10dac413e1115aa23b1b73eb956;
    let root_balance = 384769;
    let user_hash = 0x2abca1526ee7d8fb15d69e4a889dfc8677fc5900e2bfdab802c9722f782ac77a;
    let user_balance = 20284;
    let user_id = 0x1ec0c7fb4c8e03c9ad47c3bdb7772dd94d1e7b12b6b0ac15a7d7608d5399880f;
    (
        path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash,
        user_balance, user_id,
    )
}

#[test]
fn test_valid() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_valid_alice_inputs();
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
fn test_tampered_root_balance() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_valid_alice_inputs();
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance + 1,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
fn test_tampered_root_hash() {
    let (path_indices, sibling_hashes, sibling_balances, _root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_valid_alice_inputs();
    let root_hash = 0x2b249b6fbc59a41e58138da4113de32d459cc706ddf0fb53d71da8de9ff1260c;
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
fn test_tampered_user_balance() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_valid_alice_inputs();
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance + 1,
        user_id,
    )
}

#[test(should_fail)]
fn test_tampered_user_id() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, _user_id) =
        mock_valid_alice_inputs();
    let user_id = 0x15c72db183b520bc3faa33ba4b541762471126922c99fb5978c4520b9e24b972;
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
/// Proof matches Alice but the user matches Sybil
fn test_tampered_path() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, _user_hash, _user_balance, _user_id) =
        mock_valid_alice_inputs();
    let user_hash = 0x1fde8b67e63109df587559cdfe4539ed0b8d634bd46432cab17af9fb726675fb;
    let user_balance = 17055;
    let user_id = 0x15c72db183b520bc3faa33ba4b541762471126922c99fb5978c4520b9e24b972;
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
fn test_tampered_sibling_balances() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_valid_alice_inputs();
    let mut sibling_balances = sibling_balances;
    sibling_balances[0] = sibling_balances[0] + 1;
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
fn test_user_balance_overflow() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_128overflow_alice_inputs();
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
fn test_sibling_balance_overflow() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_128overflow_mallory_sibling_inputs();
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test]
fn test_sibling_balance_not_overflow_if_bigger_max_balance_bits() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_128overflow_mallory_sibling_inputs();
    assert_inclusion::<_, 129, 254, PoseidonHasher>(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
fn test_root_balance_overflow() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_128overflow_sum_alice_inputs();
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}

#[test(should_fail)]
fn test_negative_sibling_balance() {
    let (path_indices, sibling_hashes, sibling_balances, root_hash, root_balance, user_hash, user_balance, user_id) =
        mock_negative_alice_sibling_inputs();
    main(
        path_indices,
        sibling_hashes,
        sibling_balances,
        root_hash,
        root_balance,
        user_hash,
        user_balance,
        user_id,
    )
}
