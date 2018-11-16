pragma solidity ^0.4.24;
 
import "./../contracts/SupplyCore.sol";


contract TestSupplyCore is SupplyCore {
    SupplyCore newSupplyCore;
    SupplyCore supplyCore;
    address supplier = 0xa72778391Acd94e5E441B7487075AE653Fd9d4C8;
    address partnerSupplier = 0x91477947Fe96cfbA96cBe3D867Eb046E09537E99;
    function beforeEach() public {
        newSupplyCore = new SupplyCore();
        supplyCore = SupplyCore(supplier);
    }

    function stringsEqual(string memory _a, string memory _b) internal pure returns (bool) {
		bytes memory a = bytes(_a);
		bytes memory b = bytes(_b);
		if (a.length != b.length) {
            return false;
        }
			
		// @todo unroll this loop
		for (uint i = 0; i < a.length; i ++) {
            if (a[i] != b[i]) {
                return false;
            }				
        }
		return true;
	}

  /*   function char(byte b) internal pure returns (byte c) {
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
    } */

    function test_createHashSupply() public {
        uint256 countOfMedicine = 2;
        uint256 intervalTimeSupply = 2;
        bytes32 hashContract = supplyCore.createHashSupply(countOfMedicine, intervalTimeSupply);
        bytes32 hashTest = keccak256(abi.encodePacked(countOfMedicine, intervalTimeSupply, now));
        assert(hashContract == hashTest);
    }

    function test_addSupplierPartners () public {
        newSupplyCore.addSupplierPartners(partnerSupplier);
        address[] memory partners = newSupplyCore.getSupplierPartners();
        assert(partnerSupplier == partners[0]);
    }

    function test_createValidHashIn_addDrug () public {
        string memory drugName = "Aspirine";       
        uint256 drugPrice = 3;
        bytes32 hashSupply = newSupplyCore.addDrug(drugName, drugPrice);
        
        bytes32 testHash = keccak256(abi.encodePacked(drugName, drugPrice, address(this)));
       assert(hashSupply == testHash);
    }

    function test_checkDrugByHash () public {
        string memory drugName = "Aspirine";       
        uint256 drugPrice = 3;
        bytes32 hashSupply = newSupplyCore.addDrug(drugName, drugPrice);
        
        (string memory nameDrug,  uint256 priceDrug, address supplierDrug) = 
        newSupplyCore.getMedicines(hashSupply);
        assert(supplierDrug == address(this));
        assert(stringsEqual(nameDrug, drugName));
        assert(priceDrug == drugPrice);
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
        assert(hashSupply[0] == testHash); 
    }

    function test_checkSupplierByHash () public {
        string memory drugName = "Aspirine";
        uint256 drugPrice = 3;
        uint256 drugCount = 2;
        uint256 intervalSupply = 100000;
        bytes32 hashDrug = newSupplyCore.addDrug(drugName, drugPrice);
        newSupplyCore.createSupply(hashDrug, drugCount, intervalSupply);
        bytes32[] memory hashSupply = newSupplyCore.getConsumerHashes(address(this));
        address supplierDrug = newSupplyCore.checkSupplier(hashSupply[0]);
        assert(supplierDrug == address(this)); 
    }

    function test_checkParametersDrug () public {
        string memory drugName = "Aspirine";
        uint256 drugPrice = 3;
        uint256 drugCount = 2;
        uint256 intervalSupply = 100000;
        bytes32 hashDrug = newSupplyCore.addDrug(drugName, drugPrice);
        newSupplyCore.createSupply(hashDrug, drugCount, intervalSupply);
        bytes32[] memory hashSupply = newSupplyCore.getConsumerHashes(address(this)); 
        (address _consumer, uint256 _payment, string memory _nameOfMedicine, uint256 countOfMedicine, uint256 _endSupplyTime) = 
            newSupplyCore.getSupply(hashSupply[0]);
        assert(stringsEqual(_nameOfMedicine, drugName));
        assert(_consumer == address(this));
        assert(countOfMedicine == drugCount);  
        assert(_payment == drugPrice * drugCount);
        assert(_endSupplyTime == _endSupplyTime);
    }

    // function test_payment () public {
       //require(msg.value >= 0.1 ether, "0.1 ETH is required for testing"); 
        // newSupplyCore.call.value(10 finney)();
        // uint256 sum = newSupplyCore.payment();
        // Assert.equal(msg.value, 0.1 ether, "payment not equal"); 
        // Assert.equal(sum, 0.1 ether, "payment not equal");       
    // } 

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

    //function test_checkNum () public {        
        // string memory num5 = "5";
        // assert(stringsEqual(Helper.uint2hexstr(5), num5));
    // }
}