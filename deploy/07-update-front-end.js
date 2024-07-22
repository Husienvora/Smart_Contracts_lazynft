const {
    frontEndContractsFile,
    frontEndContractsFile2,
    frontEndAbiLocation,
    frontEndAbiLocation2,
} = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        log("confirmation")
    }
}

async function updateAbi() {
    // const nftMarketplace = await ethers.getContract("NftMarketplace")

    // fs.writeFileSync(
    //     `${frontEndAbiLocation2}NftMarketplace.json`,
    //     nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    // )

    // const basicNft = await ethers.getContract("BasicNft")

    // fs.writeFileSync(
    //     `${frontEndAbiLocation2}BasicNft.json`,
    //     basicNft.interface.format(ethers.utils.FormatTypes.json)
    // )

    const MarketCont = await ethers.getContract("MarketNFT721ImplementationV2")

    fs.writeFileSync(
        `${frontEndAbiLocation2}MarketNFT721ImplementationV2.json`,
        MarketCont.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    // const chainId = network.config.chainId.toString()
    // const nftMarketplace = await ethers.getContract("NftMarketplace")
    // const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile2, "utf8"))
    // if (chainId in contractAddresses) {
    //     if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
    //         contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
    //     }
    // } else {
    //     contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    // }

    // fs.writeFileSync(frontEndContractsFile2, JSON.stringify(contractAddresses))
    const Marketplace = await ethers.getContract("MarketNFT721ImplementationV2")
    const contractAddresses1 = JSON.parse(fs.readFileSync(frontEndContractsFile2, "utf8"))
    if (chainId in contractAddresses1) {
        if (
            !contractAddresses1[chainId]["MarketNFT721ImplementationV2"].includes(
                Marketplace.address
            )
        ) {
            contractAddresses1[chainId]["MarketNFT721ImplementationV2"].push(Marketplace.address)
        }
    } else {
        contractAddresses1[chainId] = { MarketNFT721ImplementationV2: [Marketplace.address] }
    }

    fs.writeFileSync(frontEndContractsFile2, JSON.stringify(contractAddresses1))
}
module.exports.tags = ["all", "frontend"]
