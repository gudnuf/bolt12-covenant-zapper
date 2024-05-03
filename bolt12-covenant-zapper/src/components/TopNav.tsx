import { Button, Navbar } from "flowbite-react";

export const TopNav = () => {
  const loggedIn = false;
  function handleLogin() {
    throw new Error("Function not implemented.");
  }

  return (
    <Navbar
      fluid
      className="bg-gradient-to-tr w-full from-gray-800 to-gray-700 flex flex-row justify-around mb-4"
    >
      {/* <Navbar.Brand
        href="/"
        className="md:ml-6 w-2/3 md:w-1/3 md:my-1 lg:w-1/4"
      >
        <span>Bolt12 Covenants Zapper</span>
      </Navbar.Brand> */}
      <div className="flex justify-end md:order-2 md:mr-6">
        {loggedIn ? (
          <Button className="mr-3">Log Out</Button>
        ) : (
          <Button onClick={handleLogin}>Login</Button>
        )}
      </div>
    </Navbar>
  );
};

export default TopNav;
