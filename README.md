# Bolt12 Covenant Zapper

We are concatenating every nostr event until we can introspect the bolt12 offer committed to in a recipeint's [kind 0 metadata](https://github.com/nostr-protocol/nips/blob/master/01.md#kinds).

## Setting up the development

### Goal

Create a regtest lightning node environment where L1 can route trough L2 to L3.

L2 will run the mint and clnrest plugins.

L1 will pay L3's offer

### Session

We'll use the flake in cln_pyshu_mint

```
cd cln_pyshu_mint
```

Enter the dev shell:

```
nix develop
```

Start your lightning network:

```
source ./startup_regtest.sh
start_ln 3
sleep 10
fund_nodes
```

### Start the Plugins

Make sure you're in the same session as you started regtest.

For some reason clnrest crashes when I have it start along with lightningd, so I disabled it in the lightning.conf created by [startup_regtest](./startup_regtest.sh).

Also, for clnrest to register the REST routes specified in the [cln_pyshu_mint](./cln_pyshu_mint), the mint plugin must be started first.

This should all work from the flake... but I didn't want to write that.

Go back up to the root dir:

```
cd ..
```

Start the _mint_ plugin:

```
l2-cli plugin start $(pwd)/cln_pyshu_mint/cashu.py
```

Start _clnrest_ and specify `clnrest-port` and `clnrest-protocol`:

```
l2-cli plugin -k subcommand=start plugin=$(pwd)/clnrest/clnrest.py clnrest-port=8080 clnrest-protocol=http
```

> _NOTE_: clnrest keeps shutting down and I can't find why. If any http request to the mint fail, make sure clnrest is still running.

### Run the Zapper

There's a React App in bolt12-covenant-zapper that uses the [cashu-ts](https://github.com/cashubtc/cashu-ts/tree/3d708fdebc366b6474516a42fb5e809beee94ee9) library and if it has nostr functionality it will use [ndk](https://github.com/nostr-dev-kit/ndk).

Open a new terminal for doing this npm stuff because we don't have node in our flake.

```
cd bolt12-covenant-zapper
npm install
npm run dev
```
