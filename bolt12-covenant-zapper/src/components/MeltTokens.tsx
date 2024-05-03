import { CashuWallet } from "@cashu/cashu-ts";
import useCashu from "../hooks/useCashu";
import { Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";

const MeltTokens = () => {
  const [amountToMelt, setAmountToMelt] = useState("");
  const [offer, setOffer] = useState("");
  const { getProofs, getWallet, customGetMeltQuote } = useCashu();

  const handleMeltTokens = async () => {
    if (!amountToMelt) {
      alert("Amount to melt is required");
      return;
    }

    if (!offer) {
      alert("BOLT 12 Offer is required");
      return;
    }

    const amountToMeltNum = parseInt(amountToMelt);

    const proofs = getProofs();

    const totalAmount = proofs.reduceRight((a, b) => a + b.amount, 0);

    if (totalAmount < amountToMeltNum) {
      alert("Not enough tokens to melt");
      return;
    }

    const wallet = getWallet();

    const { send, returnChange } = await wallet.send(amountToMeltNum, proofs);

    window.localStorage.setItem("cashu.proofs", JSON.stringify(returnChange));

    const meltQuoteRes = await customGetMeltQuote(wallet.mint.mintUrl, {
      amount: amountToMeltNum,
      request: offer,
      unit: "sat",
    });

    console.log("Quote", meltQuoteRes);

    const meltTokens = await wallet.meltTokens(meltQuoteRes, send);

    console.log("Melt Tokens", meltTokens);
  };

  return (
    <div>
      <div className="mb-5">
        <Label className="text-white text-lg">Amount to Melt</Label>
        <div>
          <TextInput
            type="number"
            value={amountToMelt}
            onChange={(e) => setAmountToMelt(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-5">
        <Label className="text-white text-lg">BOLT 12 Offer</Label>
        <div>
          <TextInput
            type="text"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleMeltTokens}>Melt Tokens</Button>
    </div>
  );
};

export default MeltTokens;
