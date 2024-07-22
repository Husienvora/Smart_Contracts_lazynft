const { expect, assert } = require("chai")
const { BigNumber, utils, Signer } = require("ethers")
const { ethers } = require("hardhat")
const { LazyMinter } = require("../../lib")

describe("NftMarket", function () {
    const bn = (input) => BigNumber.from(input)
    const BNtoBigInt = (input) => BigInt(input.toString())
    const BigInttoBN = (input) => BigNumber.from(input.toString())
    const assertBNequal = (bnOne, bnTwo) => assert.strictEqual(bnOne.toString(), bnTwo.toString())

    let nftLazyContract
    let MarketContract
    let initialized
    const nftName = "NFT Collection"
    const nftSymbol = "NFT"

    const tokenId = 10
    const quantity = 1
    const platformFee = 250
    const royaltyBasisPoints = 500
    const listingPrice = utils.parseEther("1")

    const tokenUri = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"

    beforeEach(async () => {
        ;[owner, signer, creator, buyer, addr1, addr2, wrongSigner, _] = await ethers.getSigners()
        await deployments.fixture(["LazyNFT", "MarketNFT", "MockERC20"])

        // let NFTLazy = await ethers.getContractFactory("NFT721LazyMint")
        nftLazyContract = await ethers.getContract("NFT721LazyMint")
        MarketContract = await ethers.getContract("MarketNFT721ImplementationV2")

        initialized = await MarketContract.initialize(
            owner.address,
            platformFee,
            await owner.getAddress()
        )
        await MarketContract.setSignerAddress(signer.address)

        ERC20Contract = await ethers.getContract("MintableERC20")
        // await nftLazyContract.deployed()
        const lazyMinter = new LazyMinter({
            contract: nftLazyContract,
            signer: signer,
        })
        const voucher = await lazyMinter.createVoucher(
            tokenId,
            listingPrice,
            quantity,
            royaltyBasisPoints,
            tokenUri
        )

        await nftLazyContract.setSignerAddress(signer.address)

        await nftLazyContract.connect(buyer).redeemToken(creator.address, buyer.address, voucher, {
            value: listingPrice,
        })

        await ERC20Contract.connect(addr2).mint(listingPrice)
    })
    // it("should initialize the contract correctly", async function () {
    //     const feeRecipient = await MarketContract.feeRecipient()
    //     const actualPlatformFee = await MarketContract.platformFee()

    //     expect(feeRecipient).to.equal(owner.address)
    //     expect(actualPlatformFee).to.equal(platformFee)
    // })
    // it("should allow buying listed NFT with Ether", async () => {
    //     // Sign the message
    //     const messageHash = ethers.utils.solidityKeccak256(
    //         ["address", "uint256", "address", "uint256"],
    //         [nftLazyContract.address, 10, buyer.address, listingPrice]
    //     )

    //     const signature = await signer.signMessage(ethers.utils.arrayify(messageHash))

    //     // await nftLazyContract.connect(creator).setApprovalForAll(MarketContract.address, true)
    //     await nftLazyContract.connect(buyer).setApprovalForAll(MarketContract.address, true)
    //     // Buy the NFT with Ether

    //     const initialBalance = await addr1.getBalance()

    //     await MarketContract.connect(addr1).buyItem(
    //         nftLazyContract.address,
    //         10,
    //         buyer.address,
    //         listingPrice,
    //         signature,
    //         { value: listingPrice }
    //     )
    //     const finalBalance = await buyer.getBalance()

    //     // Check if the NFT is transferred and funds are transferred
    //     const ownerOfNFT = await nftLazyContract.ownerOf(10)
    //     expect(ownerOfNFT).to.equal(addr1.address)
    //     expect(finalBalance.lt(initialBalance)).to.be.true
    // })
    it("Buying with ERC20", async () => {
        // Sign the message
        const messageHash = ethers.utils.solidityKeccak256(
            ["address", "uint256", "address", "uint256", "address"],
            [nftLazyContract.address, 10, addr2.address, listingPrice, ERC20Contract.address]
        )

        const signature = await signer.signMessage(ethers.utils.arrayify(messageHash))

        await nftLazyContract.connect(buyer).setApprovalForAll(MarketContract.address, true)

        // Buy the NFT with Ether
        // await ERC20Contract.transfer(addr2.address, 500)

        await ERC20Contract.connect(addr2).approve(MarketContract.address, listingPrice)
        const initialBalance = await ERC20Contract.balanceOf(addr2.address)
        await MarketContract.connect(buyer).acceptOfferWithERC20(
            nftLazyContract.address,
            10,
            addr2.address,
            listingPrice,
            ERC20Contract.address,
            signature
        )
        const finalBalance = await ERC20Contract.balanceOf(addr2.address)
        const ownerOfNFT = await nftLazyContract.ownerOf(10)
        expect(ownerOfNFT).to.equal(addr2.address)
        expect(finalBalance.lt(initialBalance)).to.be.true
    })
})
