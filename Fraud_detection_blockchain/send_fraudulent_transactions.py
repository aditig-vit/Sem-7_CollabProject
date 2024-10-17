from web3 import Web3
import json
import numpy as np
import joblib
import pandas as pd


ganache_url = "http://127.0.0.1:8545"
web3 = Web3(Web3.HTTPProvider(ganache_url))

if web3.is_connected():
    print("Connected to Ganache Blockchain!")
else:
    print("Failed to connect to Ganache")

#  Load the smart contract ABI and contract address
contract_address = "0x157aab71C175e9106256343b93e82C9747DfdAb0"  # Use your deployed contract address
with open('./build/contracts/TransactionLogger.json') as f:
    contract_json = json.load(f)
    contract_abi = contract_json['abi']

# Create contract instance
fraud_detection_contract = web3.eth.contract(address=contract_address, abi=contract_abi)

#Load the trained ML model (assuming you saved it after training)
model = joblib.load('fraud_detection_model.pkl')

#  Function to predict fraud and send the result to the smart contract
def predict_and_log(transaction):
    
    feature_names = [
        'type_indexed',
        'amount',
        'oldbalanceOrg',
        'newbalanceOrig',
        'oldbalanceDest',
        'newbalanceDest',
        'errorBalanceOrig',
        'errorBalanceDest'
    ]
    
    features = pd.DataFrame([[ 
        transaction['type_indexed'],
        transaction['amount'],
        transaction['oldbalanceOrg'],
        transaction['newbalanceOrig'],
        transaction['oldbalanceDest'],
        transaction['newbalanceDest'],
        transaction['errorBalanceOrig'],
        transaction['errorBalanceDest']
    ]], columns=feature_names)

    # Predicting fraud using the model
    is_fraud = model.predict(features)[0]
    
   
    print(f'Predicted isFraud for transaction {transaction["transactionId"]}: {is_fraud}')

    # If the prediction indicates fraud, log it on the blockchain
    if is_fraud:
        tx_hash = fraud_detection_contract.functions.recordTransaction(
            transaction['transactionId'],  
            transaction['type_indexed'],  
            int(transaction['amount']),  
            int(transaction['oldbalanceOrg']),  
            int(transaction['newbalanceOrig']),  
            int(transaction['oldbalanceDest']),  
            int(transaction['newbalanceDest']),  
            int(transaction['errorBalanceOrig']),  
            int(transaction['errorBalanceDest']),  
            True,  
            True  
        ).transact({'from': web3.eth.accounts[0]})

        print(f'Transaction logged: {tx_hash.hex()}')
    else:
        print(f'Transaction {transaction["transactionId"]} is not fraudulent, hence not logged.')


sample_transaction = {
    'transactionId': 3,
    'type_indexed': 4,  
    'amount': 181.0, 
    'oldbalanceOrg': 100.0,  
    'newbalanceOrig': -81.0,  
    'oldbalanceDest': 0.0, 
    'newbalanceDest': 181.0,  
    'errorBalanceOrig': 0.0, 
    'errorBalanceDest': 0.0,  
}

# Predict and log the transaction
predict_and_log(sample_transaction)
