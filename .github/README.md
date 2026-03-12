# ZK Proof of Liabilities

A Zero-Knowledge Proof of Liabilities implementation in Noir.

It allows a company to cryptographically prove to each user that their balance
is correctly included in its total liabilities without revealing any data from
the other users.

Live demo: [zk-liabilities.ndavd.com](https://zk-liabilities.ndavd.com)

- [Background](#background)
- [Circuit design](#circuit-design)
  - [Limitations](#limitations)
- [Project architecture](#project-architecture)
- [Getting started](#getting-started)
  - [Dependencies](#dependencies)
  - [Circuits](#circuits)
  - [Contracts](#contracts)
  - [Scripts](#scripts)
  - [Web demo](#web-demo)
- [References](#references)

## Background

**How can you trust that a Centralized Exchange actually holds your funds?**

The CEX would need to provide a _Proof of Solvency_:

> Proof of Solvency: Proof that the company is holding enough funds to cover
> **all** of their customers' balances.

That proof can be constructed using two other proofs:

- _Proof of Assets_: Prove that the company holds X amount
- _Proof of Liabilities_: Prove that the company's total users balances amount
  to Y

Having those two proofs, one just needs to verify that X is greater than or
equal to Y.

Proof of Assets is trivial: The company can provide a cryptographic signature
with the corresponding key to the wallet holding the funds.

**Proof of Liabilities is where the challenge lies**: How can each user know
that their balance is included in the total liabilities of the company?

The company cannot simply publish a list of all the usernames and associated
balances because then the users would have no privacy. Hashing the username with
a private salt that is only shared with the respective user is an improvement,
but still leaks the user count, all the balances and how those change over time.

A better solution is to use a _Merkle Sum Tree_. It behaves like a regular
Merkle tree, but each node also carries a balance equal to the sum of its
children's balances, with the root representing the total liabilities.

![mst img](./mst.jpg)

However, it's still not private enough: A user, Alice, would still know the
balance of another user that corresponds to her sibling leaf in the tree, would
also know the sum of balances of other two users, and so on and so forth... If
Alice had access to more accounts she could start to extract more balance
information.

**The solution is to use Zero-Knowledge Proofs** where, instead of sharing the
Merkle proof directly with the user, the CEX generates a ZKP of their inclusion
in the tree. The user can then verify the generated proof against his user hash
(which is a hash computed with their username, nonce and balance), the committed
root hash and total liabilities, ideally done on-chain. No sibling information
or any other user data is revealed in the process.

![zk-mst img](./zk-mst.jpg)

For implementation details, read the [Circuit design](#circuit-design) section.

## Circuit design

The Noir circuit is composed of a Merkle Sum Tree inclusion verification
algorithm with the following inputs:

| Input name         | Visibility |       Type       | Description                                            |
| ------------------ | :--------: | :--------------: | ------------------------------------------------------ |
| `path_indices`     | _PRIVATE_  |  `[u1; DEPTH]`   | Left/right (0/1) path from the user's leaf to the root |
| `sibling_hashes`   | _PRIVATE_  | `[Field; DEPTH]` | Hash of each sibling node along the path               |
| `sibling_balances` | _PRIVATE_  | `[Field; DEPTH]` | Balance of each sibling node along the path            |
| `root_hash`        |  _PUBLIC_  |     `Field`      | The Merkle Sum Tree root hash                          |
| `root_balance`     |  _PUBLIC_  |     `Field`      | Total liabilities                                      |
| `user_hash`        |  _PUBLIC_  |     `Field`      | Hash of the user's leaf verified off-chain by the user |
| `user_balance`     | _PRIVATE_  |     `Field`      | The user's balance                                     |
| `user_id`          | _PRIVATE_  |     `Field`      | Hash of the user's username and nonce                  |

The customization happens via the following generics:

- `DEPTH: u32`: The Merkle sum tree depth (`zk_proof_of_liabilities` uses `20`,
  which equates to $2^{20} = 1,048,576$ maximum users)
- `MAX_BALANCE_BITS: u32`: The bit-length of the balances
  (`zk_proof_of_liabilities` uses `128`, which equates to a maximum balance (or
  sum) of $2^{128} - 1 = 340,282,366,920,938,463,463,374,607,431,768,211,455$)
- `FIELD_BITS: u32`: The bit-length of the prime field used
  (`zk_proof_of_liabilities` uses `254` to be compatible with the Barretenberg
  backend)
- `H: MerkleSumTreeHasher`: Custom hasher trait (`zk_proof_of_liabilities` uses
  the BN254-compatible `Poseidon2` hasher)

The circuit asserts the following constraints:

- The user leaf (ID and balance) is included in the Merkle Sum Tree
- The sum has been performed correctly from the user leaf until the root node
- No balance or computed amount exceeds `2^MAX_BALANCE_BITS`, preventing
  overflow and negative value exploits

The circuit uses Noir's native `Field` type for all values rather than fixed
width integers, since field arithmetic has fewer constraints. The valid range is
enforced via `MAX_BALANCE_BITS` rather than relying on the type system.

The `Poseidon2` hash was chosen for its efficiency inside circuits due to the
lower number of constraints compared to general-purpose hashes like Keccak,
while offering similar security.

Although the circuit doesn't enforce it, it is recommended for the `user_id`
(also called ID) to be comprised of the hash of not only the username but also a
random nonce privately shared with the user. This prevents an attack on the
public input `user_hash`, which could be observed on-chain by the RPCs, where
one could try to bruteforce `hash[username, balance]` to deanonymize the user.

### Limitations

The trade-off is that we're trusting the CEX to generate the Merkle proof
honestly. The circuit checks for Merkle proof correctness, but the CEX could add
some fake users with negative balances to decrease the total liabilities.

This is only detectable by users whose sibling nodes contain a manipulated
balance, since the range constraint would reject a balance that wraps around the
field modulus. Any other users in the tree would receive valid proofs.

Therefore, the proof relies on a sufficient number of users verifying their
proofs, which of course cannot be enforced. The more users verify, the harder it
becomes for the CEX to manipulate the tree without being caught.

## Project architecture

The repository is organized as a monorepo composed of a Nargo workspace, Bun
workspace, and Forge project.

- [`crates/`](../crates/): Nargo workspace containing the
  `zk_proof_of_liabilities` binary crate and the `merkle_sum_tree` library crate
- [`contracts/`](../contracts/): Forge project containing the
  `ProofOfLiabilities` contract and the pre-generated `HonkVerifier`
- [`sdk/`](../sdk/): TypeScript package with Merkle Sum Tree building and proof
  input generation utilities
- [`scripts/`](../scripts/): TypeScript helper scripts
- [`web/`](../web/): Demo application
- [`mock-data/`](../mock-data/): Mock users data that is used across the app and
  to generate the tests' inputs

## Getting started

All of the commands listed should be run from the root directory.

### Dependencies

| Tool                                                            | Version                  | Used for                                       |
| --------------------------------------------------------------- | ------------------------ | ---------------------------------------------- |
| [Noir (`nargo`)](https://noir-lang.org/docs/)                   | `1.0.0-beta.19`          | Compiling the circuits                         |
| [Barretenberg (`bb`)](https://barretenberg.aztec.network/docs/) | `4.0.0-nightly.20260120` | Cryptographic backend for the circuits         |
| [Foundry (`forge`)](https://www.getfoundry.sh/)                 | `1.5.1-stable`           | Compiling and deploying the Solidity contracts |
| [Bun (`bun`)](https://bun.sh/)                                  | `1.3.1`                  | Running the scripts and web demo               |

### Circuits

The Nargo workspace is comprised of 2 crates:

- The [`zk_proof_of_liabilities`](../crates/zk_proof_of_liabilities/) binary
  crate that provides sensible defaults
- The [`merkle_sum_tree`](../crates/merkle_sum_tree/) library crate that allows
  for customization and integration into other circuits

#### Use as library

Add this library to your `Nargo.toml`:

```toml
[dependencies]
merkle_sum_tree = { tag = "v0.1.0", git = "https://github.com/ndavd/zk-proof-of-liabilities", directory = "crates/merkle_sum_tree" }
```

Refer to `crates/zk_proof_of_liabilities/src/main.nr` for a usage example.

#### Compile the circuit

```bash
nargo compile
```

#### Execute the circuit

Using the provided
[`Prover.toml`](../crates/zk_proof_of_liabilities/Prover.toml):

```bash
nargo execute
```

Using custom inputs:

```bash
nargo execute -p {PATH_TO_PROVER_TOML}
```

Refer to [Scripts](#scripts) to generate a `Prover.toml` from a custom dataset.

#### Run unit tests

```bash
nargo test
```

#### Format the code

```bash
nargo fmt
```

#### Usage with Solidity contracts

To use with Solidity contracts, add the `--oracle_hash keccak` flag to the `bb`
commands.

#### Generate the verification key

Requires the circuit to be compiled.

```bash
bb write_vk -s ultra_honk -b ./target/zk_proof_of_liabilities.json -o ./target
```

#### Generate proof and verify

Requires the circuit to be executed and the verification key to be generated.

To generate the proof:

```bash
bb prove -s ultra_honk -b ./target/zk_proof_of_liabilities.json -w ./target/zk_proof_of_liabilities.gz -o ./target
```

To verify:

```bash
bb verify -k ./target/vk -p ./target/proof
```

#### Generate the verifier Solidity contract

Requires the verification key to be generated.

```bash
bb write_solidity_verifier -s ultra_honk -k ./target/vk -o ./target/Verifier.sol
```

### Contracts

#### Install dependencies

```bash
forge install
```

#### Build the contracts

```bash
forge build
```

#### Run unit tests

```bash
forge test
```

#### Generate test coverage report

```bash
forge coverage
```

#### Format the code

```bash
forge fmt
```

#### `Verifier.sol` contract generation

The `HonkVerifier` contract is pre-generated and committed to the repository.

Regenerate it if the circuit changes. Refer to the
[Generate the verifier Solidity contract](#generate-the-verifier-solidity-contract)
section.

#### Deployments

The contracts are currently deployed in the Sepolia network:

- `Verifier.sol`:
  [`0x8b4A0163C18488542905E72FcCc3735431DE4A72`](https://sepolia.etherscan.io/address/0x8b4A0163C18488542905E72FcCc3735431DE4A72)
- `ProofOfLiabilities.sol`:
  [`0xCd99C5896C79E5354C7aEed5A99Cd2C22C7c1551`](https://sepolia.etherscan.io/address/0xCd99C5896C79E5354C7aEed5A99Cd2C22C7c1551)

For more deployment info, refer to the `broadcast/` folder.

To deploy `Verifier.sol`:

```bash
forge script contracts/script/DeployVerifier.s.sol \
--rpc-url sepolia \
--broadcast --verify
```

To deploy `ProofOfLiabilities.sol`:

```bash
forge script contracts/script/DeployProofOfLiabilities.s.sol \
{OWNER_ADDRESS} {VERIFIER_ADDRESS} \
--rpc-url sepolia \
--broadcast --verify
```

### Scripts

#### Generate `Prover.toml`

Create a CSV file with the users data. See
[`mock-data/users.csv`](../mock-data/users.csv) for reference.

```bash
bun run generate-prover-toml {PATH_TO_USER_DATA_CSV} {PROVING_USERNAME} > custom-prover.toml
```

### Web demo

#### Start the dev server

```bash
bun run dev
```

#### Build for production

```bash
bun run build
```

#### Locally preview production build

```bash
bun run preview
```

## References

- Vitalik Buterin's original proposal which inspired this project:
  https://vitalik.eth.limo/general/2022/11/19/proof_of_solvency.html
- Summa for their extensive research on ZK proof of solvency:
  https://pse.dev/projects/summa
