// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgriChain Supply Chain Contract
 * @dev Cryptographic tracking for Agricultural Batches from Farm to Fork
 */
contract AgriChain {
    enum BatchStatus { Created, InTransit, WarehouseStored, RetailAvailable, Sold }

    struct BatchRecord {
        string batchId;
        string cropName;
        uint256 quantity;
        string originLocation;
        address currentOwner;
        BatchStatus status;
        uint256 timestamp;
        string dataHash; // Keccak256 hash of payload metadata
        string prevHash; // Previous block hash in provenance chain
    }

    struct HistoryEntry {
        string batchId;
        string action;
        string actorRole;
        address actorAddress;
        uint256 timestamp;
        string txHash;
        string statusName;
    }

    // Mapping from Batch ID to BatchRecord
    mapping(string => BatchRecord) public batches;
    mapping(string => bool) public batchExists;
    mapping(string => HistoryEntry[]) public batchHistory;

    string[] public allBatchIds;

    event BatchCreated(string indexed batchId, string cropName, uint256 quantity, address indexed farmer, uint256 timestamp, string dataHash);
    event StatusUpdated(string indexed batchId, string statusName, address indexed updatedBy, uint256 timestamp, string dataHash);
    event OwnershipTransferred(string indexed batchId, address indexed previousOwner, address indexed newOwner, uint256 timestamp);

    modifier onlyBatchOwner(string memory _batchId) {
        require(batchExists[_batchId], "Batch does not exist");
        require(batches[_batchId].currentOwner == msg.sender, "Caller is not batch owner");
        _;
    }

    /**
     * @dev Register a new agricultural crop batch on the blockchain
     */
    function createBatch(
        string memory _batchId,
        string memory _cropName,
        uint256 _quantity,
        string memory _originLocation,
        string memory _dataHash
    ) public {
        require(!batchExists[_batchId], "Batch ID already exists");

        BatchRecord memory newBatch = BatchRecord({
            batchId: _batchId,
            cropName: _cropName,
            quantity: _quantity,
            originLocation: _originLocation,
            currentOwner: msg.sender,
            status: BatchStatus.Created,
            timestamp: block.timestamp,
            dataHash: _dataHash,
            prevHash: "GENESIS_HASH_0000000000000000000000000000"
        });

        batches[_batchId] = newBatch;
        batchExists[_batchId] = true;
        allBatchIds.push(_batchId);

        HistoryEntry memory entry = HistoryEntry({
            batchId: _batchId,
            action: "Batch Created at Farm",
            actorRole: "Farmer",
            actorAddress: msg.sender,
            timestamp: block.timestamp,
            txHash: _dataHash,
            statusName: "Created"
        });
        batchHistory[_batchId].push(entry);

        emit BatchCreated(_batchId, _cropName, _quantity, msg.sender, block.timestamp, _dataHash);
    }

    /**
     * @dev Update supply chain batch status and transfer ownership
     */
    function updateBatchStatus(
        string memory _batchId,
        uint8 _status,
        string memory _action,
        string memory _actorRole,
        address _newOwner,
        string memory _dataHash,
        string memory _prevHash
    ) public {
        require(batchExists[_batchId], "Batch does not exist");

        BatchRecord storage batch = batches[_batchId];
        address oldOwner = batch.currentOwner;
        batch.status = BatchStatus(_status);
        if (_newOwner != address(0)) {
            batch.currentOwner = _newOwner;
        }
        batch.dataHash = _dataHash;
        batch.prevHash = _prevHash;

        string memory statusStr = getStatusString(BatchStatus(_status));

        HistoryEntry memory entry = HistoryEntry({
            batchId: _batchId,
            action: _action,
            actorRole: _actorRole,
            actorAddress: msg.sender,
            timestamp: block.timestamp,
            txHash: _dataHash,
            statusName: statusStr
        });
        batchHistory[_batchId].push(entry);

        emit StatusUpdated(_batchId, statusStr, msg.sender, block.timestamp, _dataHash);
        if (_newOwner != address(0) && _newOwner != oldOwner) {
            emit OwnershipTransferred(_batchId, oldOwner, _newOwner, block.timestamp);
        }
    }

    /**
     * @dev Fetch batch history records
     */
    function getBatchHistory(string memory _batchId) public view returns (HistoryEntry[] memory) {
        require(batchExists[_batchId], "Batch does not exist");
        return batchHistory[_batchId];
    }

    /**
     * @dev Helper function to stringify status
     */
    function getStatusString(BatchStatus _status) internal pure returns (string memory) {
        if (_status == BatchStatus.Created) return "Created";
        if (_status == BatchStatus.InTransit) return "In Transit";
        if (_status == BatchStatus.WarehouseStored) return "Stored";
        if (_status == BatchStatus.RetailAvailable) return "Available";
        if (_status == BatchStatus.Sold) return "Sold";
        return "Unknown";
    }

    /**
     * @dev Get total count of registered batches
     */
    function getTotalBatches() public view returns (uint256) {
        return allBatchIds.length;
    }
}
