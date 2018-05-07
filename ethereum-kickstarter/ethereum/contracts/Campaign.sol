pragma solidity ^0.4.23;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint count;
        mapping(address => bool) wasApproved;
    }
    
    Request[] public requests;
    address public manager;
    uint public minContribution;
    mapping(address => bool) public approvers;
    uint public countApprovers;
    
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function Campaign(uint min, address creator) public {
        manager = creator;
        minContribution = min;
    }
    
    function contribute() public payable {
        require(msg.value > minContribution);

        approvers[msg.sender] = true;
        countApprovers++;
    }
    
    function createRequest(string description, uint value, address recipient, uint count) public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            count: 0
        });
        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        
        require(approvers[msg.sender]);
        require(!request.wasApproved[msg.sender]);
        
        request.wasApproved[msg.sender] = true;
        request.count++;
    }
    
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        
        require(request.count > (countApprovers / 2));
        require(!request.complete);
        
        request.recipient.transfer(request.value);
        request.complete = true;

    }
}