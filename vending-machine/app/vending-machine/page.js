"use client";

import Head from "next/head"
import { useState, useEffect } from "react"
import Web3 from "web3"
import vendingMachineContract from "../../blokchain/vending.js"
import "bulma/css/bulma.css"
import styles from "../VendingMachine.module.css"

const VendingMachine = () => {
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [inventory, setInventory] = useState("") // For storing the vending machine's donut inventory.
    const [myDonutBalance, setMyDonutBalance] = useState(""); // For storing the user's donut balance.
    const [buyCount, setBuyCount] = useState(""); // For storing the number of donuts the user wants to buy.
    const [restockCount, setRestockCount] = useState(""); // For storing the number of donuts to restock.
    const [web3, setWeb3] = useState(null); // For storing the Web3 instance.
    const [address, setAddress] = useState(null); // For storing the user's Ethereum address.
    const [vmContract, setVmContract] = useState(null); // For storing the smart contract instance.
    
    

    // useEffect hook to fetch data from the contract once the contract and address are available.
    useEffect(() => {
        if (vmContract) getInventoryHandler(); // Fetch the vending machine's inventory.
        if (vmContract && address) getMyDonutBalanceHandler(); // Fetch the user's donut balance.
    }, [vmContract, address]); // Dependencies - Only run when vmContract or address changes.

    // Function to get the vending machine's inventory from the blockchain.
    const getInventoryHandler = async () => {
        const inventory2 = await vmContract.methods.getVendingMachineBalance().call(); 
        // Fetch inventory using 'call' (read-only call to the blockchain).
        setInventory(Number(inventory2)); // Update state with the retrieved inventory.
    };

    // Function to get the user's donut balance from the blockchain.
    const getMyDonutBalanceHandler = async () => {
        const count = await vmContract.methods.donutBalances(address).call(); 
        // Fetch user's balance using 'call'.
        setMyDonutBalance(Number(count)); // Update state with the retrieved balance.
    };

    // Handler to update the number of donuts the user wants to buy.
    const updateDonutQty = event => {
        setBuyCount(Number(event.target.value)); // Convert input value to a number and update state.
    };

    // Handler to update the number of donuts for restocking.
    const updateRestockQty = event => {
        setRestockCount(Number(event.target.value)); // Convert input value to a number and update state.
    };

    // Function to handle donut purchases.
    const buyDonutHandler = async () => {
        try {
            await vmContract.methods.purchase(buyCount).send({
                from: address, // Send transaction from the user's address.
                value: web3.utils.toWei("0.005", "ether") * buyCount, // Multiply price by buyCount.
            });
            setSuccessMsg(`${buyCount} Donut(s) Successfully Purchased!`); // Display success message.
            getInventoryHandler(); // Refresh inventory after purchase.
            getMyDonutBalanceHandler(); // Refresh user donut balance after purchase.
        } catch (err) {
            setError(err.message); // Catch and display any errors.
        }
    };

    // Function to handle restocking donuts.
    const restockDonutHandler = async () => {
        try {
            await vmContract.methods.restock(restockCount).send({
                from: address, // Send transaction from the user's address.
                value: web3.utils.toWei("0.005", "ether") * restockCount, // Multiply price by restockCount.
            });
            setSuccessMsg(`${restockCount} Donut(s) Successfully Restocked!`); // Display success message.
            getInventoryHandler(); // Refresh inventory after restocking.
            getMyDonutBalanceHandler(); // Refresh user donut balance after restocking.
        } catch (err) {
            setError(err.message); // Catch and display any errors.
        }
    };

    // Function to connect to the user's MetaMask wallet.
    const connectWalletHandler = async () => {
        // Check if MetaMask is available in the user's browser.
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                // Request access to the user's MetaMask wallet.
                await window.ethereum.request({ method: "eth_requestAccounts" });
                // Initialize Web3 instance with MetaMask provider.
                const web3 = new Web3(window.ethereum);
                setWeb3(web3); // Set Web3 instance in state.
                // Get the user's Ethereum accounts.
                const accounts = await web3.eth.getAccounts();
                setAddress(accounts[0]); // Set the user's address.
                // Initialize the contract instance.
                const vm = vendingMachineContract(web3);
                setVmContract(vm); // Set the contract instance in state.
            } catch (err) {
                setError(err.message); // Handle any errors.
            }
        } else {
            console.log("Please install MetaMask"); // MetaMask is not installed.
        }
    };

    return (
      <div className={styles.main}> 
        <Head>
            <title>Vending Machine App</title>
            <meta name = "Description" content = "Blockchain Vending Machine App" />

        </Head>
        <nav className="navbar mt-4 mb-4"> 
            <div className="container">
                <div className="navbar-brand">
                    <h1>Blockchain Vending Machine</h1>
                </div>
                <div className="navbar-end">
                    <button onClick={connectWalletHandler} className="button is-primary">Connect to Wallet</button>
                </div>
            </div>
        </nav>
        <section>
            <div className="container">
                <h2>Vending Machine Inventory: {inventory}</h2>
            </div>
        </section>
        <section>
            <div className="container">
                <h2>My Doughnut Balance: {myDonutBalance}</h2>
            </div>
        </section>


        <section className="mt-2">
            <div className="container">
                <div className="columns is-gapless"> {/* Bulma's columns container */}
                
                {/* First column for "Buy Doughnuts" */}
                <div className="column">
                    <div className="field">
                    <label className="label">Buy Doughnuts</label>
                    <div className="field has-addons"> {/* Grouping input and button side by side */}
                        <div className="control">
                        <input 
                            onChange={updateDonutQty} 
                            className="input" 
                            type="text" 
                            placeholder="Enter Amount..."  
                            style={{ width: '135px' }}  // Control the width of input box
                        />
                        </div>
                        <div className="control">
                        <button
                            onClick={buyDonutHandler} 
                            className="button is-primary ml-2">
                            Buy Doughnuts
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                
                {/* Second column for "Restock Doughnuts" */}
                <div className="column">
                <div className="field">
                    <label className="label">Restock Doughnuts</label>
                    <div className="field has-addons"> {/* Grouping input and button side by side */}
                        <div className="control">
                        <input 
                            onChange={updateRestockQty} //change
                            className="input" 
                            type="text" 
                            placeholder="Enter Amount..."  
                            style={{ width: '135px' }}  
                        />
                        </div>
                        <div className="control">
                        <button
                            onClick={restockDonutHandler} 
                            className="button is-primary ml-2">
                            Restock Doughnuts
                        </button>
                        </div>
                    </div>
                    </div>
                </div>

                </div>
            </div>
        </section>


        


        <section>
            <div className="container has-text-danager">
                <p>{error}</p>
            </div>
        </section>
        <section>
            <div className="container has-text-success">
                <p>{successMsg}</p>
            </div>
        </section>
      </div>
    );
  }

  export default VendingMachine
  