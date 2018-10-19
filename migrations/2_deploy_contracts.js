const MetaCoin = artifacts.require("./MetaCoin.sol");
const SupplyCore = artifacts.require("./SupplyCore.sol");  

module.exports = function (deployer, network, accounts) {
  deployer.deploy(MetaCoin);
  deployer.deploy(SupplyCore,
    { gasLimit: 6721970, from: accounts[0] })
};
