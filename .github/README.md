# ZK Proof of Liabilities

A Zero-Knowledge Proof of Liabilities implementation in Noir.

It allows a company to cryptographically prove to each user that their balance
is correctly included in its total liabilities without revealing any data from
the other users.

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

The solution is to use Zero-Knowledge Proofs where, instead of sharing the
Merkle proof directly with the user, the CEX generates a ZKP of their inclusion
in the tree. The user can then verify the generated proof against his user hash
(which is a hash computed with their username, nonce and balance), the committed
root hash and total liabilities, ideally done on-chain. No sibling information
or any other user data is revealed in the process.

For implementation details, read the [Circuit design](#cirtuit-design) section.

![zk-mst img](./zk-mst.jpg)

## Circuit design

## References

- Vitalik Buterin's original proposal which inspired this project:
  https://vitalik.eth.limo/general/2022/11/19/proof_of_solvency.html
- Summa for their extensive research on ZK proof of solvency:
  https://pse.dev/projects/summa
