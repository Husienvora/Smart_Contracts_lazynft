const { ethers } = require("hardhat")

async function clearPendingTransactions() {
    const provider = ethers.provider
    const pendingTxs = await provider.send("txpool_content", [])
    const txHashes = Object.keys(pendingTxs.pending)

    console.log(`Found ${txHashes.length} pending transactions.`)

    for (const txHash of txHashes) {
        try {
            const tx = await provider.getTransaction(txHash)
            console.log(`Attempting to cancel transaction: ${txHash}`)
            const cancelTx = await provider.send("eth_sendTransaction", [
                { from: tx.from, to: tx.to, nonce: tx.nonce, gas: 0 },
            ])
            console.log(`Transaction ${txHash} cancelled: ${cancelTx}`)
        } catch (error) {
            console.error(`Error cancelling transaction ${txHash}: ${error}`)
        }
    }

    console.log("Pending transactions cleared.")
}

clearPendingTransactions()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
