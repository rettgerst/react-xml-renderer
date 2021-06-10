import { ReactNode } from 'react';
import Reconciler from 'react-reconciler';
import { JSDOM } from 'jsdom';

function shallowDiff(
	oldObj: { [x: string]: any },
	newObj: { [x: string]: any }
) {
	// Return a diff between the new and the old object
	const uniqueProps = new Set([
		...Object.keys(oldObj),
		...Object.keys(newObj)
	]);
	const changedProps = Array.from(uniqueProps).filter(
		propName => oldObj[propName] !== newObj[propName]
	);

	return changedProps;
}

const jsdom = new JSDOM(`<root></root>`, {
	contentType: 'application/xml',
	storageQuota: 10000000
});

const { window } = jsdom;

const { document } = window;

const TinyDOMRenderer = Reconciler({
	// appendChild for direct children
	appendInitialChild(
		parentInstance: { appendChild: (arg0: any) => void },
		child: any
	) {
		parentInstance.appendChild(child);
	},

	// Create the DOMElement, but attributes are set in `finalizeInitialChildren`
	createInstance(
		type: any,
		props: any,
		rootContainerInstance: any,
		hostContext: any,
		internalInstanceHandle: any
	) {
		return document.createElement(type);
	},

	createTextInstance(
		text: string,
		rootContainerInstance: any,
		internalInstanceHandle: any
	) {
		// A TextNode instance is returned because literal strings cannot change their value later on update
		return document.createTextNode(text);
	},

	// Actually set the attributes and text content to the domElement and check if
	// it needs focus, which will be eventually set in `commitMount`
	finalizeInitialChildren(
		domElement: HTMLElement,
		type: any,
		props: { [x: string]: any }
	) {
		// Set the prop to the domElement
		Object.keys(props).forEach(propName => {
			const propValue = props[propName];

			if (propName === 'children') {
				// Set the textContent only for literal string or number children, whereas
				// nodes will be appended in `appendChild`
				if (
					typeof propValue === 'string' ||
					typeof propValue === 'number'
				) {
					domElement.textContent = propValue.toString();
				}
			} else {
				if (!['string', 'number'].includes(typeof propValue))
					throw new Error(
						`Prop "${propName}" had type ${typeof propValue} - all attributes must be string or number!`
					);
				domElement.setAttribute(propName, propValue);
			}
		});

		return false;
	},

	// Useful only for testing
	getPublicInstance(inst: any) {
		return inst;
	},

	// Commit hooks, useful mainly for react-dom syntethic events
	prepareForCommit() {},
	resetAfterCommit() {},

	// Calculate the updatePayload
	prepareUpdate(
		domElement: any,
		type: any,
		oldProps: { [x: string]: any },
		newProps: { [x: string]: any }
	) {
		// Return a diff between the new and the old props
		return shallowDiff(oldProps, newProps);
	},

	getRootHostContext(rootInstance: any) {
		return {};
	},
	getChildHostContext(parentHostContext: any, type: any) {
		return {};
	},

	shouldSetTextContent(type: string, props: { children: any }) {
		return (
			type === 'textarea' ||
			typeof props.children === 'string' ||
			typeof props.children === 'number'
		);
	},

	now: () => {
		// noop
	},

	supportsMutation: true,

	useSyncScheduling: true,

	appendChild(
		parentInstance: { appendChild: (arg0: any) => void },
		child: any
	) {
		parentInstance.appendChild(child);
	},

	// appendChild to root container
	appendChildToContainer(
		parentInstance: { appendChild: (arg0: any) => void },
		child: any
	) {
		parentInstance.appendChild(child);
	},

	removeChild(
		parentInstance: { removeChild: (arg0: any) => void },
		child: any
	) {
		parentInstance.removeChild(child);
	},

	removeChildFromContainer(
		parentInstance: { removeChild: (arg0: any) => void },
		child: any
	) {
		parentInstance.removeChild(child);
	},

	insertBefore(
		parentInstance: { insertBefore: (arg0: any, arg1: any) => void },
		child: any,
		beforeChild: any
	) {
		parentInstance.insertBefore(child, beforeChild);
	},

	insertInContainerBefore(
		parentInstance: { insertBefore: (arg0: any, arg1: any) => void },
		child: any,
		beforeChild: any
	) {
		parentInstance.insertBefore(child, beforeChild);
	},

	commitUpdate(
		domElement: HTMLElement,
		updatePayload: any[],
		type: any,
		oldProps: { [x: string]: any; style: { [x: string]: any } },
		newProps: { [x: string]: any; style: { [x: string]: any } },
		internalInstanceHandle: any
	) {
		updatePayload.forEach((propName: string) => {
			// children changes is done by the other methods like `commitTextUpdate`
			if (propName === 'children') {
				const propValue = newProps[propName];
				if (
					typeof propValue === 'string' ||
					typeof propValue === 'number'
				) {
					domElement.textContent = propValue.toString();
				}
				return;
			} else if (
				newProps[propName] ||
				typeof newProps[propName] === 'number'
			) {
				domElement.setAttribute(propName, newProps[propName]);
			} else {
				domElement.removeAttribute(propName);
			}
		});
	},

	commitMount(
		domElement: { focus: () => void },
		type: any,
		newProps: any,
		internalInstanceHandle: any
	) {
		domElement.focus();
	},

	commitTextUpdate(
		textInstance: { nodeValue: any },
		oldText: any,
		newText: any
	) {
		textInstance.nodeValue = newText;
	},

	resetTextContent(domElement: { textContent: string }) {
		domElement.textContent = '';
	}
} as any);

export default function renderXML(element: ReactNode) {
	const domContainer = document.createElement('root');

	// @ts-ignore
	let root = domContainer._reactRootContainer;

	if (!root) {
		// Remove all children of the domContainer
		let rootSibling;
		while ((rootSibling = domContainer.lastChild)) {
			domContainer.removeChild(rootSibling);
		}

		// @ts-ignore
		const newRoot = TinyDOMRenderer.createContainer(domContainer);
		// @ts-ignore
		root = domContainer._reactRootContainer = newRoot;
	}

	TinyDOMRenderer.updateContainer(element, root, null, () => {});

	return domContainer.innerHTML;
}
