const assert  = require('assert');
const ganache = require('ganache-cli');
const Web3    = require('web3');
const web3    = new Web3(ganache.provider());

const compiledFactory  = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	factory = await new web3.eth.Contract(JSON.parse(compiledFactory	.interface))
		.deploy({ data: compiledFactory.bytecode })
		.send({ from: accounts[0], gas: '1000000' });

		await factory.methods.createCampaign('100').send({
			from: accounts[0],
			gas: '1000000'
		});

		[campaignAddress] = await factory.methods.getDeployedCampaigns().call();
		campaign = await new web3.eth.Contract(
			JSON.parse(compiledCampaign.interface),
			campaignAddress
		);
});

describe('Campaigns', () => {

	// Deploys a basic factory and campagin
	it('deploys a factory and a campaign', () => {
		assert.ok(factory.options.address);
		assert.ok(campaign.options.address);
	});

	// Marks caller as campaign manager
	it('marks caller as campaign manager', async () => {
		const manager = await campaign.methods.manager().call();
		assert.equal(accounts[0], manager);
	});

	// Allows people to contribute and marks them as approvers
	it('allows people to contribute crypto and marks them as approvers', async () => {
		await campaign.methods.contribute().send({
			value: '200',
			from: accounts[1]
		});

		const isContributer = await campaign.methods.approvers(accounts[1]).call()
		assert(isContributer);
	});

	// Requires minimum campaign contribution
	it('requires a minimum contribution', async () => {
		try {
			await campaign.methods.contribute().send({
				value: '5',
				from: accounts[1]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	// Allows manager to make a payment request
	it('allows a manager to make a payment request', async () => {
		await campaign.methods
			.createRequest('Buy food', '100', accounts[1], 0)
			.send({
				from: accounts[0],
				gas: '1000000'
			});
			const request = await campaign.methods.requests(0).call();

			assert.equal('Buy food', request.description);
	});

	// Process a payment request
	it('processes request', async () => {
		await campaign.methods.contribute().send({
			from: accounts[0],
			value: web3.utils.toWei('10', 'ether')
		});

		await campaign.methods
			.createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1], 0)
			.send({
				from: accounts[0],
				gas: '1000000'
			});

		await campaign.methods.approveRequest(0).send({
			from: accounts[0],
			gas: '1000000'
		});

		await campaign.methods.finalizeRequest(0).send({
			from: accounts[0],
			gas: '1000000'
		});

		let balance = await web3.eth.getBalance(accounts[1]);
		balance = web3.utils.fromWei(balance, 'ether');
		assert(balance > 104);
	});

	// Process payment request for multiple accounts
	it('processing multiple requests', async () => {
		await campaign.methods.contribute().send({
			from: accounts[0],
			value: web3.utils.toWei('10', 'ether')
		});

		await campaign.methods
			.createRequest('ABBA', web3.utils.toWei('3', 'ether'), accounts[1], 0)
			.send({
				from: accounts[0],
				gas: '1000000'
			});

		await campaign.methods
			.createRequest('BBAA', web3.utils.toWei('4', 'ether'), accounts[2], 0)
			.send({
				from: accounts[0],
				gas: '1000000'
			});

		await campaign.methods.approveRequest(0).send({
			from: accounts[0],
			gas: '1000000'
		});

		await campaign.methods.finalizeRequest(0).send({
			from: accounts[0],
			gas: '1000000'
		});

		let balance = await web3.eth.getBalance(accounts[0]);
		balance = web3.utils.fromWei(balance, 'ether');
		assert(balance > 50);
	});

});