/*
@author : hgedia
WARNING : ONLY FOR TESTING PURPOSES. USE AT YOUR OWN RISK!
*/

const Web3 = require('web3');
const ENSContract = require('./abi/ensContract')
const TestRegistrarContract = require('./abi/fifsRegistrarContract')
const ResolverContract = require('./abi/resolverContract');
const ReverseRegistrarContract = require('./abi/reverseRegistrarContract');
const DefaultReverseResolverContract = require('./abi/defaultReverseResolverContract');
const namehash = require('eth-ens-namehash')
const Accounts = require('web3-eth-accounts');

function sectionBegin(title){
    console.log("*".repeat(100))
    console.log("SECTION  :  "+ title +"");
    console.log("-".repeat(100))
}

function sectionEnd(){
    console.log("*".repeat(100))
    console.log('\n');
}


function printHash(hash){
    console.log("Transaction hash : " + hash);    
}

function printError(err){
    console.log("Error : " + JSON.stringify(err));
}


function getWeb3() {
    console.log("Connecting to network  RINKEBY" );
    var web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io'));
    return web3;}

const start = async function(){
    

    //GLOBAL CONFIGURATION
    //Create account TESTING KEY ONLY: DONOT USE ON MAINNET
    //*******************************************************************************************/
    const WALLET_PRIV_KEY ='<PRIV_KEY>' //ex: '0x.....................'
    const WALLET_ADDR =   '<WALLET_ADDR>' // ex : '0x....................'
    const SUB_DOMAIN_RESOLVED_ADDRESS = '<ETH_ADDR>' //ex :'0x................'   
    //*******************************************************************************************/

    //RINKEBY CONFIGURATION
    //********************************************************************************************/    
    const ENS_CONTRACT_ADDRESS              = '0xe7410170f87102df0055eb195163a03b7f2bff4a'
    const PUBLIC_RESOLVER_CONTRACT_ADDRESS  = '0x78eC43974a0dF993730c2c88398aA010783cE7C9'
    const DEFAULT_REVERSE_RESOLVER_ADDRESS  = "0xb231c8Fc409425a9E6150ca23D6c567F0A20F4d0"
    //********************************************************************************************/    


    //1. Initialize ENS Contract
    sectionBegin('INIT DATA')
    let web3 = getWeb3();
    //Add the account which will be used by web3    
    web3.eth.accounts.wallet.add(WALLET_PRIV_KEY);    
    const ENS_TLD = 'test'    
    
    const FULL_DOMAIN_STR = '<DOMAIN_STR>' //ex : 'nintendo.test';
    const SUB_DOMAIN_STR =  '<DOMAIN_STR>' //ex : 'nintendo';


    const SHA3_NEW_SUBNODE_HASH = web3.utils.sha3(SUB_DOMAIN_STR)
    const NAMEHASH_FULL_DOMAIN = namehash.hash(FULL_DOMAIN_STR); 

    let NAMEHASH_FULL_WITH_SUBDOMAIN = namehash.hash('<SUB_DOMAIN_STR>') //ex namehash.hash('mario.nintendo.test');
    let SHA3_NEW_SUBDOMAIN_HASH = web3.utils.sha3('<SUB_DOMAIN_STR>') //ex : mario


    let ens = ENSContract.getEnsContract(web3, ENS_CONTRACT_ADDRESS);    
    let tldHash = namehash.hash(ENS_TLD);
    let tldOwner = await ens.methods.owner(tldHash).call();
    console.log("Registrar Owner for "+ ENS_TLD + ' is: ' + tldOwner);
    
    //2. Get test registrar for TLD
    let testRegistrar = TestRegistrarContract.getFifsRegistrarContract(web3, tldOwner);    
    let expiry = await testRegistrar.methods.expiryTimes(SHA3_NEW_SUBNODE_HASH).call()
    console.log("Expiry for domain is " + new Date (expiry * 1000))     
    sectionEnd();

    //3. Register Domain
    sectionBegin('REGISTER DOMAIN')
    txResult = await testRegistrar.methods.register(SHA3_NEW_SUBNODE_HASH,WALLET_ADDR).send({from:WALLET_ADDR })
                                                    .once('transactionHash', printHash);
    expiry = await testRegistrar.methods.expiryTimes(SHA3_NEW_SUBNODE_HASH).call()
    console.log("Expiry is now " + new Date(expiry * 1000))
    sectionEnd();

    //4. Set a public resolver for the domain
    sectionBegin('SET PUBLIC RESOLVER FOR DOMAIN')
    await ens.methods.setResolver(NAMEHASH_FULL_DOMAIN, PUBLIC_RESOLVER_CONTRACT_ADDRESS).send({ from: WALLET_ADDR }).once('transactionHash', printHash);
    sectionEnd();

    //5. Point the resolver to your address    
    sectionBegin('SET RESOLVER TO POINT TO REQUIRED ADDRESS')
    let publicResolver = ResolverContract.getResolverContract(web3, PUBLIC_RESOLVER_CONTRACT_ADDRESS);      
    await publicResolver.methods.setAddr(NAMEHASH_FULL_DOMAIN, WALLET_ADDR).send({ from: WALLET_ADDR }).once('transactionHash', printHash);
    sectionEnd();

    //6. Check if your address was set correcty in resolver
    // Query ENS for resolver for the name hash
    sectionBegin('TEST RESOLUTION FROM DOMAIN TO ADDRESS')
    console.log("Querying ENS to get resolver for domain : " + FULL_DOMAIN_STR)
    let resolver =await ens.methods.resolver(NAMEHASH_FULL_DOMAIN).call();
    console.log("Resolver for this domain is " + JSON.stringify(resolver))
    // Query resolver for the address
    publicResolver = ResolverContract.getResolverContract(web3, resolver)
    let resolvedAddr =await publicResolver.methods.addr(NAMEHASH_FULL_DOMAIN).call();
    console.log("Resolved address is " + resolvedAddr);
    sectionEnd();


    
    //7. Register subdomain    
    sectionBegin('REGISTER SUBDOMAIN')
    await ens.methods.setSubnodeOwner(NAMEHASH_FULL_DOMAIN, SHA3_NEW_SUBDOMAIN_HASH, WALLET_ADDR).send({ from: WALLET_ADDR })
                                                    .once('transactionHash', printHash)
                                                    .once('error' , printError);

    sectionEnd();
    
    //8.Set the resolver for this node
    sectionBegin('SET PUBLIC RESOLVER FOR SUB-DOMAIN')
    publicResolver = ResolverContract.getResolverContract(web3, PUBLIC_RESOLVER_CONTRACT_ADDRESS)
    await publicResolver.methods.setAddr(NAMEHASH_FULL_WITH_SUBDOMAIN, SUB_DOMAIN_RESOLVED_ADDRESS).send({from: WALLET_ADDR })
                                                    .once('transactionHash', printHash)
                                                    .once('error', printError);
    sectionEnd();
    
    //9.Point the subnodes resolver to our public resolver
    sectionBegin('SET RESOLVER TO POINT TO REQUIRED ADDRESS')
    await ens.methods.setResolver(NAMEHASH_FULL_WITH_SUBDOMAIN, PUBLIC_RESOLVER_CONTRACT_ADDRESS).send({ from:WALLET_ADDR })
                                                    .once('transactionHash', printHash)
    sectionEnd();


    //10. Check if resolution worked
    sectionBegin('TEST RESOLUTION FROM SUB-DOMAIN TO ADDRESS')
    resolver = await ens.methods.resolver(NAMEHASH_FULL_WITH_SUBDOMAIN).call();
    console.log("Resolver is " + JSON.stringify(resolver));
    publicResolver = ResolverContract.getResolverContract(web3, resolver)
    resolvedAddr = await publicResolver.methods.addr(NAMEHASH_FULL_WITH_SUBDOMAIN).call();
    console.log("Resolved address is " + resolvedAddr);
    sectionEnd();


    //Reverse Resolution
    sectionBegin('REVERSE RESOLUTION CLAIM REVERSE RECORD')
    let reverseDomainHash = namehash.hash('addr.reverse');
    let reverseDomainAddress = await ens.methods.owner(reverseDomainHash).call();
    console.log("Reverse registrar is at : " + JSON.stringify(reverseDomainAddress));


    //11. Claim the address
    let reverseRegistrar = ReverseRegistrarContract.getReverseRegistrarContract(web3,reverseDomainAddress);   
    let result = await reverseRegistrar.methods.claim(WALLET_ADDR).send({from: WALLET_ADDR})
                                                    .once('transactionHash', printHash);
    
    //12. Ensure node is correct    
    let NAMEHASH_REVERSE_WALLET_ADDR = namehash.hash(WALLET_ADDR.slice(2) + '.addr.reverse')
    let reverseNodeOwner = await ens.methods.owner(NAMEHASH_REVERSE_WALLET_ADDR).call();    
    console.log("Reverse node owner is  : " + JSON.stringify(reverseNodeOwner));
    sectionEnd();



    //13. Set resolver
    sectionBegin('REVERSE RESOLUTION SET RESOLVER')
    await ens.methods.setResolver(NAMEHASH_REVERSE_WALLET_ADDR, DEFAULT_REVERSE_RESOLVER_ADDRESS).send({ from: WALLET_ADDR })
                                                        .once('transactionHash', printHash);
    sectionEnd();

    //14.Update resolver    
    sectionBegin('REVERSE RESOLUTION UPDATE RESOLVER SET NAME')
    let defaultReverseResolver = DefaultReverseResolverContract.getDefaultReverseResolver(web3,DEFAULT_REVERSE_RESOLVER_ADDRESS);
    await defaultReverseResolver.methods.setName(NAMEHASH_REVERSE_WALLET_ADDR,"monday.wakawaka").send({from: WALLET_ADDR})
                                                                .once('transactionHash', printHash);    
    
    sectionEnd();
    
    //15. Check if the reverse resolution is correct    
    sectionBegin("REVERSE RESOLVER TEST")
    resolver = await ens.methods.resolver(NAMEHASH_REVERSE_WALLET_ADDR).call();
    console.log("Reverse Resolver is located at " + DEFAULT_REVERSE_RESOLVER_ADDRESS +" : " + resolver);
    defaultReverseResolver = DefaultReverseResolverContract.getDefaultReverseResolver(web3, resolver);
    let name = await defaultReverseResolver.methods.name(NAMEHASH_REVERSE_WALLET_ADDR).call();
    console.log("Address is resolved to " + name);
    sectionEnd();
}
start();