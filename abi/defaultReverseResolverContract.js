module.exports.getDefaultReverseResolver = function getDefaultReverseResolver(web3, contractAddress) {

    var defRevResolverContract = new web3.eth.Contract([
        {
            "constant": false,
            "inputs": [
                {
                    "name": "node",
                    "type": "bytes32"
                },
                {
                    "name": "_name",
                    "type": "string"
                }
            ],
            "name": "setName",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "ensAddr",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "ens",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ], contractAddress)
    defRevResolverContract.options.gas = 5000000;
    return defRevResolverContract;
}