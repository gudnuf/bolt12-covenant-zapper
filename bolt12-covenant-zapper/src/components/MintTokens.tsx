import { CashuMint, CashuWallet, MintQuoteResponse } from "@cashu/cashu-ts";
import { useState } from "react";
import useCashu from "../hooks/useCashu";
import { Button } from "flowbite-react";

const MintTokens = () => {
  const [mintQuote, setMintQuote] = useState<MintQuoteResponse | null>(null);
  const amountToMint = 50;

  const { addProofsToBalance } = useCashu();

  const handleGetMintQuote = async () => {
    const keyset = JSON.parse(localStorage.getItem("cashu.keyset") || "{}");

    if (!keyset) {
      alert("No keyset found. Add a mint first");
      return;
    }

    const wallet = new CashuWallet(new CashuMint(keyset.mintUrl), {
      keys: keyset,
    });

    const mintQuoteRes = await wallet.getMintQuote(amountToMint);

    console.log("Quote", mintQuoteRes.quote);
    console.log("Request", mintQuoteRes.request);

    setMintQuote(mintQuoteRes);
  };

  const handleMintTokens = async () => {
    if (!mintQuote) alert("Start mint first");

    const keyset = JSON.parse(localStorage.getItem("cashu.keyset") || "{}");

    if (!keyset) {
      alert("No keyset found. Add a mint first");
      return;
    }

    const wallet = new CashuWallet(new CashuMint(keyset.mintUrl), {
      keys: keyset,
    });

    const { proofs } = await wallet.mintTokens(amountToMint, mintQuote!.quote);

    addProofsToBalance(proofs);

    setMintQuote(null);
  };

  return (
    <div className="flex flex-col max-w-fit mb-3">
      <Button onClick={handleGetMintQuote}>Get Invoice to Mint</Button>
      {mintQuote && (
        <div className="max-w-1/2">
          <h2>Pay This:</h2>
          <pre className="">{mintQuote?.request}</pre>
          <Button onClick={handleMintTokens}>
            Finish Minting and Claim Tokens
          </Button>
        </div>
      )}
    </div>
  );
};

export default MintTokens;
