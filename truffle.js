const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*",
      gas: "7984452",
    }
  },
  solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	},
};
