import {
  CashuMint,
  CashuWallet,
  MeltQuotePayload,
  MeltQuoteResponse,
  Proof,
} from "@cashu/cashu-ts";

const useCashu = () => {
  const addProofsToBalance = async (proofs: Proof[]) => {
    const localProofs = JSON.parse(
      localStorage.getItem("cashu.proofs") || "[]"
    );

    localStorage.setItem(
      "cashu.proofs",
      JSON.stringify([...localProofs, ...proofs])
    );
  };

  const getProofs = () => {
    return JSON.parse(localStorage.getItem("cashu.proofs") || "[]") as Proof[];
  };

  const getWallet = () => {
    const keyset = JSON.parse(localStorage.getItem("cashu.keyset") || "{}");

    if (!keyset.mintUrl)
      throw new Error("Wallet not initialized. Add a mint first.");

    const mint = new CashuMint(keyset.mintUrl);

    return new CashuWallet(mint, {
      keys: keyset,
    });
  };

  // const customGetMeltQuote
  const customGetMeltQuote = async (
    mintUrl: string,
    meltQuotePayload: MeltQuotePayload & { amount: number }
  ): Promise<MeltQuoteResponse> => {
    const wallet = getWallet();

    const res = await fetch(wallet.mint.mintUrl + "/v1/melt/quote/bolt11", {
      method: "POST",
      body: JSON.stringify(meltQuotePayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("bad response");
    }

    const data = await res.json();

    if (
      typeof data?.amount !== "number" ||
      typeof data?.fee_reserve !== "number" ||
      typeof data?.quote !== "string"
    ) {
      throw new Error("bad response");
    }

    return data;
  };

  const getBalance = () => {
    const proofs = getProofs();
    const totalAmount = proofs.reduce((a, b) => a + b.amount, 0);
    return totalAmount;
  };

  return {
    addProofsToBalance,
    getProofs,
    getWallet,
    customGetMeltQuote,
    getBalance,
  };
};

export default useCashu;
