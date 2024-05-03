import { useEffect, useState } from "react";
import useCashu from "../hooks/useCashu";

const Balance = () => {
  const [balance, setBalance] = useState(0);
  const { getBalance } = useCashu();

  useEffect(() => {
    setBalance(getBalance());

    const interval = setInterval(() => {
      setBalance(getBalance());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-5xl">{balance} sats</h1>
    </div>
  );
};

export default Balance;
