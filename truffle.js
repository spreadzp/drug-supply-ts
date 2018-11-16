const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: { 
      development: {
        host: 'localhost',
        port: 9545,
        gas: 6000000,
        network_id: '*' // Match any network id
      }
  },
  solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	},
};
