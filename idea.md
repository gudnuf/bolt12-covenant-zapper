# Pay BOLT12 Offers from NOSTR Profiles Using Cashu

## Embed an offer in user's kind 0 metadata:

Create functionality to edit a user profile and add an input for bolt12 offer.

```json
{
  "id": ...,
  "pubkey": ...,
  "created_at":...,
  "kind": 0,
  "tags": [
  ],
  "content": {name: <username>, about: <string>, picture: <url, string>, offer: <bolt12_offer>},
  "sig": ...
}
```

Now we will have a nostr profile containing a bolt12 offer.

The problem then becomes, how do we pay this offer if only Clams can pay a bolt12.

## Create a Cashu mint that can melt to bolt12

Use github.com/gudnuf/cln_pyshu_mint

Add bolt12 method to melt route: `/v1/melt/bolt12`

- `POST /v1/melt/bolt12/quote`

  - `{amount: 5, offer: "lno1..."}

- Response: { invoice: <invoice_from_offer>, ...}

- Client can validate the invoice matches amount requests

  - ideally validate the invoice came from the offer

- `POST /v1/melt/bolt12`
  - `{inputs: <cashu_proofs>`

## The final product

- nostr client
- cashu wallet
- nostr profiles with bolt12 offers
- View other profiles
- Zap these profiles with cashu balance from mint supporting bolt12

## The testing environment

- Regtest lightning nodes (or lnplay) Alice -> Bob -> Carol
- Bob runs the mint
- Alice opens up nostr cashu client
- Alice mints tokens by paying an invoice to Bob
- Carol creates a nostr profile with her bolt 12
- Alice zaps carol with cashu balance
  - get bolt12 offer from Carol's profile
  - initiate melt with Alice's tokens and Carol's bolt12
  - Bob pays carol over lightning by melting Alice's tokens
