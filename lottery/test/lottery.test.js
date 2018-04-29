const assert   = require('assert');
const ganache  = require('ganache-cli');
const Web3     = require('web3');
const provider = ganache.provider();
const web3     = new Web3(provider);
const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
		.send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contracts', () => {
	// Make sure the contract deploys
	it('deploys', () => {
		assert.ok(lottery.options.address);
	});
	
	// Allow one contract to enter lottery
	it('allows one account to enter', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether')
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length);
	});

	// Allow multiple contracts to enter lottery
	it('allows multiple accounts to enter', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether')
		});
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether')
		});
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei('0.02', 'ether')
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		assert.equal(3, players.length);
	});

	// Requires minimum amount of ether
	it('requires a minimum amount of ether', async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: 200
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	// Error should be thrown if someone other than the manager picks the winner
	it('throws if error if manager is not doing their job', async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	// Runs through contract from start to finish
	it('verifies contract is correct', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether')
		});

		const initialBalance = await web3.eth.getBalance(accounts[0]);
		await lottery.methods.pickWinner().send({ from: accounts[0] });		
		const finalBalance = await web3.eth.getBalance(accounts[0]);
		const difference = finalBalance - initialBalance;
		
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});

		assert(difference > web3.utils.toWei('1.8', 'ether'));
		assert.equal(0, players.length);
	});
});