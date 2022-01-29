const RouterEventEmitter = artifacts.require("RouterEventEmitter");
const DexSwapFactory = artifacts.require("IDexSwapFactory");
const DexSwapRelayer = artifacts.require("DexSwapRelayer");
const DexSwapRouter = artifacts.require("DexSwapRouter");
const OracleCreator = artifacts.require("OracleCreator");
const DexSwapArbitrage = artifacts.require("DexSwapArbitrage");
const WETH = artifacts.require("WETH");
const argValue = (arg, defaultValue) => process.argv.includes(arg) ? process.argv[process.argv.indexOf(arg) + 1] : defaultValue
const network = () => argValue('--network', 'local')

// RINKEBY
// const DEXSWAP_FACTORY = "0xC9ae161dc43957cD56ed7CaC2cC4e302b44Df374";
// const DEXSWAP_ROUTER = "0xA83De401F65a8D13ee9331210B459A3229a70943";
// const WETH_RINKEBY = "0xc778417E063141139Fce010982780140Aa0cD5Ab"; 
// const UNISWAP_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
// const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

// MATIC
// const QUICKSWAP_FACTORY = ""; 
// const QUICKSWAP_ROUTER = ""; 
// const DEXSWAP_FACTORY = "";
// const DEXSWAP_ROUTER = "";
// const WETH_MATIC = ""; 


module.exports = async (deployer) => {

    const senderAccount = (await web3.eth.getAccounts())[0];

    if (network() === "rinkeby") {


        console.log(":: Deploying Oracle");
        await deployer.deploy(OracleCreator);
        const ORACLEInstance = await OracleCreator.deployed();
        console.log();
        console.log(`ORACLE CREATOR ADDRESS:`,    ORACLEInstance.address);
        console.log("====================================================================");

        console.log();
        console.log(":: REUSE DEXSWAP FACTORY");
        let DexSwapFactoryInstance = await DexSwapFactory.at(DEXSWAP_FACTORY);
        console.log(`DEXSWAP FACTORY:`, DexSwapFactoryInstance.address);
        console.log();
        console.log(":: REUSE WETH"); 
        const WETHInstance = await WETH.at(WETH_RINKEBY);
        await WETHInstance.deposit({ from: senderAccount, value: 1 });

        console.log();
        console.log(":: REUSE DEPLOYING ROUTER");
        const DEXSWAP_ROUTERInstance = await DexSwapRouter.at(DEXSWAP_ROUTER);
        console.log("ROUTER ADDRESS:", DEXSWAP_ROUTERInstance.address);

        console.log();
        console.log(":: DEPLOYING ROUTER EMITTER");
        await deployer.deploy(RouterEventEmitter);
        const ROUTER_EMITTER_INSTANCE = await RouterEventEmitter.deployed();
        console.log("ROUTER EMITTER ADDRESS:", ROUTER_EMITTER_INSTANCE.address);


        console.log();
        console.log(":: REUSE FACTORY FOR UNISWAP");
        let UniswapFactoryInstance = await DexSwapFactory.at(UNISWAP_FACTORY);
        console.log(`UNISWAP FACTORY:`, UniswapFactoryInstance.address);
        

        console.log();
        console.log(":: REUSE ROUTER ON UNISWAP");
        const UniswapRouterInstance = await DexSwapRouter.at(UNISWAP_ROUTER);
        console.log("ROUTER ADDRESS:", UniswapRouterInstance.address);


        console.log();
        console.log(":: Deploying Relayer");
        const DEXSWAP_RELAYER = await deployer.deploy(DexSwapRelayer, senderAccount, DexSwapFactoryInstance.address, DEXSWAP_ROUTERInstance.address, UniswapFactoryInstance.address, UniswapRouterInstance.address, WETHInstance.address, ORACLEInstance.address);
        console.log(`DEXSWAP RELAYER: ${await DEXSWAP_RELAYER.address}`);


        console.log();
        console.log(":: DEPLOYING ARBITRAGE");
        await deployer.deploy(DexSwapArbitrage, UniswapFactoryInstance.address, DEXSWAP_ROUTERInstance.address);
        const ARBITRAGE_INSTANCE = await DexSwapArbitrage.deployed();
        console.log(`ARBITRAGE ADDRESS: ${await ARBITRAGE_INSTANCE.address}`);

        console.log("DONE");

    } else if (network() === "mumbai") {
    } else if (network() === "matic") {}
};
