import React from "react";
import logo from "./logo.svg";
import "./App.css";
import TopNav from "./components/TopNav";
import AddMint from "./components/AddMint";
import MintTokens from "./components/MintTokens";
import MeltTokens from "./components/MeltTokens";
import Balance from "./components/Balance";

function App() {
  return (
    <div className="App flex flex-col p-10">
      {/* <TopNav /> */}
      <Balance />
      <AddMint />
      <MintTokens />
      <MeltTokens />
    </div>
  );
}

export default App;
