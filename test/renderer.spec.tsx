/// <reference types="jest" />

import React from 'react';
import renderXML from '../src/renderer';
import XML from '../src/XMLElement';

test('string children', () => {
	const xml = renderXML(<XML.link foo="bar">hello world</XML.link>);

	expect(xml).toMatchInlineSnapshot(
		`"<link foo=\\"bar\\">hello world</link>"`
	);
});

test('nested nodes', () => {
	const xml = renderXML(
		<XML.foo>
			<XML.bar></XML.bar>
		</XML.foo>
	);

	expect(xml).toMatchInlineSnapshot(`"<foo><bar/></foo>"`);
});

test('error on bad prop type', () => {
	const jsx = <XML.foo asdf={new Date() as any}></XML.foo>;

	const spy = jest.spyOn(console, 'error');
	spy.mockImplementation(() => {});

	expect(() => renderXML(jsx)).toThrowErrorMatchingInlineSnapshot(
		`"Prop \\"asdf\\" had type object - all attributes must be string or number!"`
	);

	spy.mockRestore();
});
