// SPDX-License-Identifier: MIT 
// Solidity version
pragma solidity ^0.8.0;

contract FraudDetection {
    struct Transaction {
        uint256 transactionId;
        uint256 typeIndexed;  // Type of transaction (changed from string to uint256)
        uint256 amount;        // Transaction amount
        uint256 oldbalanceOrg; // Previous balance of the origin account
        uint256 newbalanceOrig; // New balance of the origin account
        uint256 oldbalanceDest; // Previous balance of the destination account
        uint256 newbalanceDest; // New balance of the destination account
        uint256 errorBalanceOrig; // Error balance of the origin account
        uint256 errorBalanceDest; // Error balance of the destination account
        bool isFraud;         // Indicates if the transaction is fraudulent
        bool isLogged;        // Indicates if the transaction is logged
    }

    // Mapping from transaction ID to Transaction struct
    mapping(uint256 => Transaction) public transactions;

    // Event for logging transaction recording
    event TransactionRecorded(
        uint256 transactionId,
        uint256 typeIndexed,
        uint256 amount,
        uint256 oldbalanceOrg,
        uint256 newbalanceOrig,
        uint256 oldbalanceDest,
        uint256 newbalanceDest,
        bool isFraud,
        bool isLogged
    );

    // Function to record a transaction
    function recordTransaction(
        uint256 transactionId, 
        uint256 typeIndexed, // Now accepting uint256 type for transaction type
        uint256 amount, 
        uint256 oldbalanceOrg, // Changed from string to uint256
        uint256 newbalanceOrig, 
        uint256 oldbalanceDest, // Changed from string to uint256
        uint256 newbalanceDest, 
        uint256 errorBalanceOrig, // Changed from string to uint256
        uint256 errorBalanceDest, 
        bool isLogged, 
        bool isFraud // Renamed from isFlagged to isFraud for clarity
    ) public {
        // Create a new Transaction struct and store it in the mapping
        transactions[transactionId] = Transaction(
            transactionId,
            typeIndexed,
            amount,
            oldbalanceOrg,
            newbalanceOrig,
            oldbalanceDest,
            newbalanceDest,
            errorBalanceOrig,
            errorBalanceDest,
            isFraud,
            isLogged
        );

        // Emit an event for logging purposes
        emit TransactionRecorded(
            transactionId,
            typeIndexed,
            amount,
            oldbalanceOrg,
            newbalanceOrig,
            oldbalanceDest,
            newbalanceDest,
            isFraud,
            isLogged
        );
    }
}
