import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import { Link } from '../../../routes';
import Layout from '../../../components/Layout';
import Campaign from '../../../ethereum/campaign';

class RequestIndex extends Component {
	static async getInitialProps(props) {
		const { address } = props.query;
		const campaign = Campaign(address);

		const requestCount = await campaign.methods.getRequestsCount().call();

		const request = await Promise.all(
			Array(parseInt(requestCount))	.fill().map((element, index) => {
				return campaign.methods.request(index).call();
			});
		);

		console.log("Here you go: " + request);

		return { address };
	}
	render() {
		return (
			<Layout>
				<h3>Requests</h3>
				<Link route={`/campaigns/${this.props.address}/requests/new`}>
					<a>
						<Button primary>Add Request</Button>
					</a>
				</Link>
			</Layout>
		);
	}
}

export default RequestIndex;