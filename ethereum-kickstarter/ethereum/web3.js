import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
	// handle code inside browser with metamask available
	web3 = new Web3(window.web3.currentProvider);
} else {
	// we are on the server *OR* the user is not running metamask
	const provider = new Web3.providers.HttpProvider(
		'https://rinkeby.infura.io/Q2YzEPrszqdrnFf2uRoW'
	);

	web3 = new Web3(provider);
}

export default web3;