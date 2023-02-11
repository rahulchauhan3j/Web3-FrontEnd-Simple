import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import addressContract from "./contract/ContractAddress.json";
import abi from "./contract/StoreAndRetrieve.json";

function App() {
  const [walleButtonLabel, setWalletButtonLabel] =
    useState("Connect To Wallet");

  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [verified, setVerified] = useState("false");
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [retrievedData, setRetrievedData] = useState("");

  const handleAddressChange = async (event) => {
    setAddress(event.target.value);
    setErrorMessage("");
  };

  const handleFirstNameChange = async (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = async (event) => {
    setLastName(event.target.value);
  };

  const handleNationalIdChange = async (event) => {
    setNationalId(event.target.value);
  };

  useEffect(() => {
    window.ethereum.on("accountsChanged", connectHandler);
    window.ethereum.on("chainChanged", chainChanged);
  });

  const chainChanged = () => {
    setWalletAddress("");
    setWalletBalance(0);
    setAddress("");
    setFirstName("");
    setLastName("");
    setVerified(false);
    setSigner(null);
    setProvider(null);
    setContract(null);
    setWalletButtonLabel("Connect To Wallet");
  };

  const connectHandler = async () => {
    setErrorMessage("");
    if (!window.ethereum) {
      setErrorMessage("Metamask not installed");
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      setProvider(provider);

      const signer = provider.getSigner();
      setSigner(signer);

      const walletAddress = await signer.getAddress();
      setWalletAddress(walletAddress);

      const walletBalance = await signer.getBalance();
      setWalletBalance(ethers.utils.formatEther(walletBalance));

      const contract = new ethers.Contract(
        addressContract.address,
        abi.abi,
        signer
      );
      setContract(contract);

      setWalletButtonLabel("Connected");
    } catch (error) {
      setErrorMessage(error);
    }
  };

  const storePersonData = async () => {
    setErrorMessage("");
    try {
      const store = await contract.storePersonData(
        address,
        firstName,
        lastName,
        nationalId
      );
      await store.wait(1);
      setErrorMessage("Person Data Stored");
    } catch (error) {
      setErrorMessage(error.data.message);
    }
  };

  const retrieveAddressData = async () => {
    setErrorMessage("");
    setRetrievedData("");
    try {
      console.log("m");
      const retrieve = await contract.retrievePersonData(address);
      // console.log(retrieve);
      setRetrievedData(
        `First Name - ${retrieve[0]}, Last Name - ${retrieve[1]}, National Id - ${retrieve[2]}`
      );
    } catch (error) {
      setErrorMessage(error.data.message);
    }
  };

  const verifyPersonData = async () => {
    setErrorMessage("");
    try {
      const verifyData = await contract.verifyPerson(address, true);
      const verified = verifyData.wait();
    } catch (error) {
      setErrorMessage(error.data.message);
    }
  };

  const isPersonVerified = async () => {
    setErrorMessage("");
    try {
      const isVerified = await contract.isVerified(address);
      setVerified(isVerified.toString());
    } catch (error) {
      setErrorMessage(error.data.message);
    }
  };
  return (
    <div className="App">
      <fieldset className="fieldset_css">
        <button type="button" onClick={connectHandler}>
          {walleButtonLabel}
        </button>
        {walletAddress !== "" && <span>Address {walletAddress} </span>}
        <br></br>
        {walletAddress !== "" && <span>Balance {walletBalance} eth</span>}
        {errorMessage && <span>{errorMessage}</span>}
      </fieldset>
      <br></br>
      <br></br>
      <fieldset className="fieldset_css">
        <label htmlFor="Address">Address</label>
        <input type="text" id="Address" onChange={handleAddressChange}></input>
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          onChange={handleFirstNameChange}
        ></input>
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          onChange={handleLastNameChange}
        ></input>
        <label htmlFor="nationalId">National Id</label>
        <input
          type="text"
          id="nationalId"
          onChange={handleNationalIdChange}
        ></input>
        <button type="button" onClick={storePersonData}>
          Store Person Data
        </button>
      </fieldset>
      <br></br>
      <br></br>
      <fieldset className="fieldset_css">
        <label htmlFor="AddressToRetrieve">Address</label>
        <input
          type="text"
          id="AddressToRetrieve"
          onChange={handleAddressChange}
        ></input>
        <button type="button" onClick={retrieveAddressData}>
          Retrieve Person Data
        </button>
      </fieldset>
      {retrievedData && <span>{retrievedData}</span>}
      <br></br>
      <br></br>
      <fieldset className="fieldset_css">
        <label htmlFor="AddressToVerify">Address</label>
        <input
          type="text"
          id="AddressToVerify"
          onChange={handleAddressChange}
        ></input>
        <button type="button" onClick={verifyPersonData}>
          Verify Person Data
        </button>
      </fieldset>
      <br></br>
      <br></br>
      <fieldset className="fieldset_css">
        <label htmlFor="AddressToVerifyCheck">Address</label>
        <input
          type="text"
          id="AddressToVerifyCheck"
          onChange={handleAddressChange}
        ></input>
        <button type="button" onClick={isPersonVerified}>
          Is Person Verified
        </button>
        <span>Verification Status - {verified}</span>
      </fieldset>
    </div>
  );
}

export default App;
