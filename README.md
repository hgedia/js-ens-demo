# ENS Demo

This script is a refactor of ensutils-testnet.js. It is hooked to web3 1.0 which is used to sign/send transactions. This script should not be used in any production environment, and is only for demo. No error handling is present and it runs on a lot of assumptions of having a clean setup environment, ETH populated amonngst others.

Currently working on RINKEBY testnet &  configured to run on the same. If you wish to try a different network , please change the necessary variables in the file.

# Usage

Install dependencies:

    npm -i

Open ens-testutils.js & etup the following variables:

Create a wallet from MEW and send some Rinkeby ETH to the address 
Setup the variables as below:

    const WALLET_PRIV_KEY ='<PRIV_KEY>' //ex: '0x.....................'
    const WALLET_ADDR =   '<WALLET_ADDR>' // ex : '0x....................'
    const SUB_DOMAIN_RESOLVED_ADDRESS = '<ETH_ADDR>' //ex :'0x................'   

    const FULL_DOMAIN_STR = '<DOMAIN_STR>' //ex : 'nintendo.test';
    const SUB_DOMAIN_STR =  '<DOMAIN_STR>' //ex : 'nintendo';
    
    let NAMEHASH_FULL_WITH_SUBDOMAIN = namehash.hash('<SUB_DOMAIN_STR>') //ex namehash.hash('mario.nintendo.test');
    let SHA3_NEW_SUBDOMAIN_HASH = web3.utils.sha3('<SUB_DOMAIN_STR>') //ex : mario
    
Run

      node ens-testutils.js

This will carry out all steps of registering domains/subdomains and reverse registering the address.

Or Open the code and investigate the required section.

