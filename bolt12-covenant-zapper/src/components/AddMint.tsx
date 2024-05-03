import { useEffect, useState } from "react";
import { CashuMint } from "@cashu/cashu-ts";
import { Button, TextInput } from "flowbite-react";

const AddMint = () => {
  const [mintUrl, setMintUrl] = useState<string>("");

  const handleAddMint = async () => {
    const mint = new CashuMint(mintUrl);

    const { keysets } = await mint.getKeys();

    console.log("Keysets", keysets);

    if (keysets.length === 0) {
      alert("No keysets found for this mint.");
      return;
    }

    const keyset = keysets[0];

    localStorage.setItem(
      "cashu.keyset",
      JSON.stringify({ ...keyset, mintUrl })
    );
  };

  useEffect(() => {
    const currentKeys = JSON.parse(
      localStorage.getItem("cashu.keyset") || "{}"
    );

    if (currentKeys.mintUrl) {
      setMintUrl(currentKeys.mintUrl);
    }
  }, []);

  return (
    <div className="flex space-x-5 mb-3">
      <TextInput
        type="text"
        placeholder="Mint url"
        value={mintUrl}
        onChange={(e) => setMintUrl(e.target.value)}
        // helperText={<p>ie http://localhost:8080 to target cln_pyshu_mint</p>}
      />
      <Button onClick={handleAddMint}>Add Mint</Button>
    </div>
  );
};

export default AddMint;
