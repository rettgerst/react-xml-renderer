import React from 'react';
import { ReactTinyDOM } from '../renderer/xml';

const Link = (props: any) => React.createElement('link', props);

describe('asdf', () => {
	test('asdf', () => {
		const xml = ReactTinyDOM.render(
			<Link foo="bar">hello world</Link>,
			() => {}
		);
		expect(xml).toMatchInlineSnapshot(
			`"<link foo=\\"bar\\">hello world</link>"`
		);
	});
});
