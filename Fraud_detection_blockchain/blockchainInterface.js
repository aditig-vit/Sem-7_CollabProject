const fs = require('fs'); 
const path = require('path');
const Web3 = require('web3').default; 
require('dotenv').config(); 


const web3 = new Web3('http://127.0.0.1:8545');

// Path to the compiled contract JSON (ABI and bytecode)
const contractPath = path.resolve(__dirname, '..', 'build', 'contracts', 'TransactionLogger.json');
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const abi = contractJson.abi;

const contractAddress = "0x157aab71C175e9106256343b93e82C9747DfdAb0"; 

// Initialize the contract
const contract = new web3.eth.Contract(abi, contractAddress);

const fromAddress = ''; // add address
const privateKey = ''; 

async function recordTransaction(transaction) {
    const { transactionId, type_indexed, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest, errorBalanceOrig, errorBalanceDest } = transaction;

    try {
        // Estimate gas limit
        const gasEstimate = await contract.methods.recordTransaction(
            transactionId.toString(),
            type_indexed.toString(),
            amount.toString(),
            oldbalanceOrg.toString(),
            newbalanceOrig.toString(),
            oldbalanceDest.toString(),
            newbalanceDest.toString(),
            errorBalanceOrig.toString(),
            errorBalanceDest.toString(),
            true, 
            false 
        ).estimateGas({ from: fromAddress });

        const tx = await contract.methods.recordTransaction(
            transactionId.toString(),
            type_indexed.toString(),
            amount.toString(),
            oldbalanceOrg.toString(),
            newbalanceOrig.toString(),
            oldbalanceDest.toString(),
            newbalanceDest.toString(),
            errorBalanceOrig.toString(),
            errorBalanceDest.toString(),
            true, 
            false 
        ).send({
            from: fromAddress,
            gas: gasEstimate, 
            gasPrice: web3.utils.toWei('10', 'gwei') 
        });  
        console.log('Transaction logged:', tx);
    } catch (error) {
        console.error('Error recording transaction:', error.message);
    }
}

async function getTransaction(transactionId) {
    try {
        // Retrieve transaction details using the actual contract method
        const transactionDetails = await contract.methods.getTransaction(transactionId).call();
        
        // Log the transaction details
        console.log(`Transaction details for ID ${transactionId}:`, {
            transactionId: transactionDetails[0],
            typeIndexed: transactionDetails[1],
            amount: transactionDetails[2],
            oldbalanceOrg: transactionDetails[3],
            newbalanceOrig: transactionDetails[4],
            oldbalanceDest: transactionDetails[5],
            newbalanceDest: transactionDetails[6],
            errorBalanceOrig: transactionDetails[7],
            errorBalanceDest: transactionDetails[8],
            isFraud: transactionDetails[9],
            isLogged: transactionDetails[10]
        });
    } catch (error) {
        console.error('Error retrieving transaction:', error.message);
    }
}


(async () => {
    const sampleTransaction = {
        transactionId: 1, // Ensure this ID is unique for each transaction
        type_indexed: 0, 
        amount: web3.utils.toWei('150', 'ether'), // Convert amount to Wei if necessary
        oldbalanceOrg: web3.utils.toWei('2000', 'ether'), 
        newbalanceOrig: web3.utils.toWei('1850', 'ether'),
        oldbalanceDest: web3.utils.toWei('300', 'ether'), 
        newbalanceDest: web3.utils.toWei('450', 'ether'),
        errorBalanceOrig: web3.utils.toWei('0', 'ether'),  
        errorBalanceDest: web3.utils.toWei('0', 'ether')   
    };

    // Record the sample transaction
    await recordTransaction(sampleTransaction);

    // Retrieve the first transaction (ID: 1)
    await getTransaction(1);
})();
