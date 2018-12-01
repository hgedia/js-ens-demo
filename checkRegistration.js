
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
    /*
		Account 0xa3c774849ce21065aa20cbf09bcce87e6745a954
		ENS : 0xdc8c103fa851fd82519aa746bd9d09d0f23f1849
		ENS FIFS Registrar : 0xe33268719544743ef90afac9a5e638f293dba770
		Reverse Registrar : 0x00f11a321a2b0ab72865c8adee762a9fe5e47913
		Default Reverse resolver  : 0x27fde9fcc8fde10eb397e245e5b6532b50bbb2d7
		Livepeer Subdomain Registrar : 0xefebd4d3abe74137ad5f34b3a9adc52f83a51e35

    */
    sectionBegin("FORWARD BACKWARD RESOLUTION TEST")
    const FULL_DOMAIN = 'hi.livepeer.eth'
    const NAMEHASH_FULL_DOMAIN = namehash.hash(FULL_DOMAIN)
    const ENS_CONTRACT_ADDRESS = '0xdc8c103fa851fd82519aa746bd9d09d0f23f1849'
    const PUBLIC_RESOLVER_CONTRACT_ADDRESS = "0x2406b1d278063dca34a2a878a983d5489f10d5ab"
    const USER_ADDRESS = '0x1e68cc2Cfd9f8F5eb530419922fBF7ac82b7EB0F'
    
    let web3 = getWeb3();    
    let ens = ENSContract.getEnsContract(web3, ENS_CONTRACT_ADDRESS); 
    let domainOwner = await ens.methods.owner(NAMEHASH_FULL_DOMAIN).call();
    console.log("Owner is " + domainOwner);
    let reverseDomainHash = namehash.hash('addr.reverse');
    let reverseDomainAddress = await ens.methods.owner(reverseDomainHash).call();    
    let NAMEHASH_REVERSE_WALLET_ADDR = namehash.hash(USER_ADDRESS.slice(2) + '.addr.reverse')
    resolver = await ens.methods.resolver(NAMEHASH_REVERSE_WALLET_ADDR).call();    
    defaultReverseResolver = DefaultReverseResolverContract.getDefaultReverseResolver(web3, resolver);
    let name = await defaultReverseResolver.methods.name(NAMEHASH_REVERSE_WALLET_ADDR).call();
    console.log("Address is resolved to " + name);
    sectionEnd();  
}
start();