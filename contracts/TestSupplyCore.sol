pragma solidity ^0.4.24;

import "./contracts/SupplyCore.sol";
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

contract TestSupplyCore is SupplyCore {
    SupplyCore newSupplyCore;
    SupplyCore supplyCore;

    function beforeEach() public {
        newSupplyCore = new SupplyCore();
        supplyCore = SupplyCore(DeployedAddresses.SupplyCore());
    }

    function char(byte b) internal pure returns (byte c) {
        if (b < 10) {
            return byte(uint8(b) + 0x30);
        } else {
            return byte(uint8(b) + 0x57);
        }
    }

    function bytes32string(bytes32 b32) internal pure returns (string out) {
        bytes memory s = new bytes(64);

        for (uint i = 0; i < 32; i++) {
            byte b = byte(b32[i]);
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[i*2] = char(hi);
            s[i*2+1] = char(lo);            
        }

        out = string(s);
    }

    function uint2hexstr(uint i) internal pure returns (string) {
        if (i == 0) {
            return "0";
        }
        uint j = i;
        uint length;
        while (j != 0) {
            length++;
            j = j >> 4;
        }
        uint mask = 15;
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
       /*  uint numStart = 48;
        uint letterStarn = 65; */
        while (i != 0) {
            uint curr = (i & mask);
            bstr[k--] = curr > 9 ? byte(55 + curr ) : byte(48 + curr); // 55 = 65 - 10
            i = i >> 4;
        }
        return string(bstr);
    }

    function addressToString(address _addr) public pure returns(string) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(51);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function test_createHashSupply() public { 
        uint256 countOfMedicine = 2;
        uint256 intervalTimeSupply = 2;
        bytes32 hashContract = supplyCore.createHashSupply(countOfMedicine, intervalTimeSupply);
        bytes32 hashTest = keccak256(abi.encodePacked(countOfMedicine, intervalTimeSupply, now));
        Assert.equal(hashContract, hashTest, "Hash not equal");
    }

    function test_addSupplierPartners () public {        
        newSupplyCore.addSupplierPartners(address(supplyCore));
        address[] memory partners = newSupplyCore.getSupplierPartners();
        Assert.equal(address(supplyCore), partners[0], "Address of partner not equal");
    }

    function test_createValidHashIn_addDrug () public {
        string memory drugName = "Aspirine";       
        uint256 drugPrice = 3;
        bytes32 hashSupply = newSupplyCore.addDrug(drugName, drugPrice);
        
        bytes32 testHash = keccak256(abi.encodePacked(drugName, drugPrice, address(this)));
        Assert.equal(hashSupply, testHash, "hashes not equal");
    }

    function test_checkDrugByHash () public {
        string memory drugName = "Aspirine";       
        uint256 drugPrice = 3;
        bytes32 hashSupply = newSupplyCore.addDrug(drugName, drugPrice);
        
        (string memory nameDrug,  uint256 priceDrug, address supplier) = 
        newSupplyCore.getMedicines(hashSupply);
        Assert.equal(supplier, address(this), "addresses not equal");
        Assert.equal(nameDrug, drugName, "names of drug not equal");
        Assert.equal(priceDrug, drugPrice, "prices of drug not equal");
    }

    function test_checkHashSupply () public {
        string memory drugName = "Aspirine";       
        uint256 drugPrice = 3;
        uint256 drugCount = 2;
        uint256 intervalSupply = 100000;
        bytes32 hashDrug = newSupplyCore.addDrug(drugName, drugPrice);

        newSupplyCore.createSupply(hashDrug, drugCount, intervalSupply);
        bytes32 testHash = newSupplyCore.createHashSupply(drugCount, intervalSupply);
        bytes32[] memory hashSupply = newSupplyCore.getConsumerHashes(address(this));
        Assert.equal(hashSupply[0], testHash, "hashes not equal"); 
    }

    function test_checkSupplierByHash () public {
        string memory drugName = "Aspirine";
        uint256 drugPrice = 3;
        uint256 drugCount = 2;
        uint256 intervalSupply = 100000;
        bytes32 hashDrug = newSupplyCore.addDrug(drugName, drugPrice);
        newSupplyCore.createSupply(hashDrug, drugCount, intervalSupply);
        bytes32[] memory hashSupply = newSupplyCore.getConsumerHashes(address(this));
        address supplier = newSupplyCore.checkSupplier(hashSupply[0]);
        Assert.equal(supplier, address(this), "addresses not equal"); 
    }

    function test_checkParametersDrug () public {
        string memory drugName = "Aspirine";
        uint256 drugPrice = 3;
        uint256 drugCount = 2;
        uint256 intervalSupply = 100000;
        bytes32 hashDrug = newSupplyCore.addDrug(drugName, drugPrice);
        newSupplyCore.createSupply(hashDrug, drugCount, intervalSupply);
        bytes32[] memory hashSupply = newSupplyCore.getConsumerHashes(address(this)); 
        (address _consumer, uint256 _payment, string memory _nameOfMedicine, uint256 countOfMedicine, uint256 _endSupplyTime) = newSupplyCore.getSupply(hashSupply[0]);
        Assert.equal(_nameOfMedicine, drugName, "name the drug not equal");
        Assert.equal(_consumer, address(this), "addresses not equal");
        Assert.equal(countOfMedicine, drugCount, "count not equal");  
        Assert.equal(_payment, drugPrice * drugCount, "payment not equal");
        Assert.equal(_endSupplyTime, _endSupplyTime, "_endSupplyTime not equal");
    }

  /*   function test_payment () public {
        // msg.value = 1 ether;
        // uint256 sumPayment = 10 finney10 finney;
        newSupplyCore.call.value(10 finney)();
        uint256 sum = newSupplyCore.payment();
        Assert.equal(sum, sum, "payment not equal");       
    }  */

   /*  function test_checkFinishCosignSupply () public {
        string memory drugName = "Aspirine";
        uint256 drugPrice = 3;
        uint256 drugCount = 2;
        uint256 intervalSupply = 100000;
        newSupplyCore.addSupplierPartners(address(supplyCore));
        bytes32 hashDrug = newSupplyCore.addDrug(drugName, drugPrice);
        newSupplyCore.createSupply(hashDrug, drugCount, intervalSupply);
        bytes32[] memory hashSupply = newSupplyCore.getConsumerHashes(address(this));
        newSupplyCore.cosignSupply(hashSupply[0]);
        bool finishCosing = newSupplyCore.checkAllConsignSupply(hashSupply[0]);
        Assert.equal(finishCosing, true, "not all supply partner make cosign");
    } */

    function test_checkNum () public {        
        string memory num5 = "5";
        Assert.equal(uint2hexstr(5), num5, "num not equal");
    }
}