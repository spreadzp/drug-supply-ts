pragma solidity ^0.4.24;

import "./../contracts/SupplyCore.sol";
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

contract TestSupplyCore is SupplyCore {
    SupplyCore newSupplyCore;
    SupplyCore supplyCore;

    function beforeEach() public {
        newSupplyCore = new SupplyCore();
        supplyCore = SupplyCore(DeployedAddresses.SupplyCore());
    }

    function char(byte b) internal  returns (byte c) {
        if (b < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }


    function bytes32string(bytes32 b32) internal  returns (string out) {
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
        if (i == 0) return "0";
        uint j = i;
        uint length;
        while (j != 0) {
            length++;
            j = j >> 4;
        }
        uint mask = 15;
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        uint numStart = 48;
        uint letterStarn = 65;
        while (i != 0){
            uint curr = (i & mask);
            bstr[k--] = curr > 9 ? byte(55 + curr ) : byte(48 + curr); // 55 = 65 - 10
            i = i >> 4;
        }
        return string(bstr);
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

    function test_addDrug () public {
        string memory drugName = "Aspirine";
       
        uint256 drugPrice = 3;
        bytes32 hashMedicineFromContract = newSupplyCore.addDrug(drugName, drugPrice);
        // string stringAddr = string(msg.sender); 
        /* bytes32 memory hashtest = "eda84831b4151f6bd1a84f98c88cf3dd2554daf5590ab893acd9355fca3154be";
        string memory converted = bytes32string(hashMedicineFromContract);
        Assert.equal(hashtest, hashMedicineFromContract, converted); */
      /*   bytes32 hashMedicine = keccak256(abi.encodePacked(drugName, drugPrice, msg.sender));
        bytes32[] memory hashFromContractMedicine = newSupplyCore.getDrugsHashes(msg.sender); */
        //address supplier= newSupplyCore.getMedicines(bytes32 hashDrug)(hashMedicineFromContract);
        // Assert.equal(hashMedicineFromContract, hashMedicineFromContract, "Hash of supply not equal");
        // Assert.equal(nameDrug, drugName, "Hash of supply not equal");
       // Assert.equal(supplier, msg.sender, "Hash of supply not equal");
    }

    function test_checkNum () public {        
        string memory num5 = "5";
        Assert.equal(uint2hexstr(6), num5, "num not equal");
    }
}