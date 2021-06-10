import { createElement } from 'react';
import { ElementProps } from './types';

const xmlElement =
	<P = ElementProps>(name: string) =>
	(props: P) =>
		createElement(name, props);

export default xmlElement;
