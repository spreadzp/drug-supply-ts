const SupplyCore = artifacts.require("./SupplyCore.sol");
/* const TestSupplyCore = artifacts.require("./TestSupplyCore.sol");   */

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SupplyCore,
    { gasLimit: 6721970, from: accounts[0] }); 
    
  /* deployer.deploy(TestSupplyCore,
    { gasLimit: 6721970, from: accounts[0] }); */
};
