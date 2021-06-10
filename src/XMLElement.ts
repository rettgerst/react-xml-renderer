import xmlElement from './create-element';
import { XMLElement } from './types';

const XML = new Proxy(
	{},
	{
		get(_, tag: string) {
			return xmlElement(tag);
		}
	}
) as Record<string, XMLElement>;

export default XML;
