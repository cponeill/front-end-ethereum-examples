/*****************************************************
* @title compile.js
* @dev delete entire build folder
*   read entire `campaign.sol` from contracts folder
*   compile both contracts with solidity compiler
*   write output to `build` directory
******************************************************/

const path = require('path');
const solc = require('solc');
const fs   = require('fs-extra');

// delete entire build folder
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);


// read entire `Campaign.sol` from contracts folder
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');
const output = solc.compile(source, 1).contracts;

// compile both contracts with solidity compiler
fs.ensureDirSync(buildPath);

// write output to `build` directory
for (let contract in output) {
	fs.outputJsonSync(
		path.resolve(buildPath, contract.replace(':', '') + '.json'),
		output[contract]
	);
}