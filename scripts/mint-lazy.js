const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const { LazyMinter } = require("../lib")
const { utils, Signer } = require("ethers")

const PRICE = utils.parseEther("0.1")
const BNtoBigInt = (input) => BigInt(input.toString())
async function mintAndList() {
    const tokenId = 911
    const quantity = 1
    const platformFee = 250
    const royaltyBasisPoints = 500
    const listingPrice = utils.parseEther("0.001")
    const tokenUri =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"

    const NftContract = await ethers.getContract("NFT721LazyMint")
    // console.log(NftContract.address)

    const [owner] = await ethers.getSigners()

    const lazyMinter = new LazyMinter({ contract: NftContract, signer: owner })
    const voucher = await lazyMinter.createVoucher(
        tokenId,
        listingPrice,
        quantity,
        royaltyBasisPoints,
        tokenUri
    )
    let previousBalance = BNtoBigInt(await owner.getBalance())
    await NftContract.setSignerAddress(owner.address)
    let signadd = await NftContract.getSignerAddress()
    console.log(signadd)
    const gasPrice = ethers.utils.parseUnits("1", "gwei") // Set an appropriate gas limit
    const mintTx = await NftContract.redeemToken(owner.address, owner.address, voucher, {
        value: listingPrice,
        gasPrice: gasPrice, // Set the gas limit
    })
    console.log("Step 1")
    console.log(mintTx)
    const mintTxReceipt = await mintTx.wait(1)
    console.log("Step 2")

    const tokenId_fetched = mintTxReceipt.events[0].args.tokenId
    console.log(tokenId_fetched)

    if (network.config.chainId == 31337) {
        // Moralis has a hard time if you move more than 1 at once!
        await moveBlocks(1, (sleepAmount = 1000))
        let currentBalance = previousBalance - BNtoBigInt(await owner.getBalance())
        console.log(currentBalance)
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
