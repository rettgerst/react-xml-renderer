import React, { DOMElement } from 'react';
import Reconciler, { HostConfig } from 'react-reconciler';
import emptyObject from 'fbjs/lib/emptyObject';
import { debugMethods } from '../utils/debug-methods';
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

function isUppercase(letter: string) {
	return /[A-Z]/.test(letter);
}

function isUnitlessProperty(name: string): boolean {
	throw new Error('Function not implemented.');
}

function setStyles(domElement: HTMLElement, styles: any) {
	Object.keys(styles).forEach(name => {
		const rawValue = styles[name];
		const isEmpty =
			rawValue === null ||
			typeof rawValue === 'boolean' ||
			rawValue === '';

		// Unset the style to its default values using an empty string
		if (isEmpty) domElement.style[name as any] = '';
		else {
			const value =
				typeof rawValue === 'number' && !isUnitlessProperty(name)
					? `${rawValue}px`
					: rawValue;

			domElement.style[name as any] = value;
		}
	});
}

const jsdom = new JSDOM(`<root></root>`, {
	contentType: 'application/xml',
	storageQuota: 10000000
});

const { window } = jsdom;

const { document } = window;

function isEventName(propName: string) {
	return (
		propName.startsWith('on') &&
		window.hasOwnProperty(propName.toLowerCase())
	);
}

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
		props: { [x: string]: any; autoFocus?: any }
	) {
		// Set the prop to the domElement
		Object.keys(props).forEach(propName => {
			const propValue = props[propName];

			if (propName === 'style') {
				setStyles(domElement, propValue);
			} else if (propName === 'children') {
				// Set the textContent only for literal string or number children, whereas
				// nodes will be appended in `appendChild`
				if (
					typeof propValue === 'string' ||
					typeof propValue === 'number'
				) {
					domElement.textContent = propValue.toString();
				}
			} else if (propName === 'className') {
				domElement.setAttribute('class', propValue);
			} else if (isEventName(propName)) {
				const eventName = propName.toLowerCase().replace('on', '');
				domElement.addEventListener(eventName, propValue);
			} else {
				domElement.setAttribute(propName, propValue);
			}
		});

		// Check if needs focus
		switch (type) {
			case 'button':
			case 'input':
			case 'select':
			case 'textarea':
				return !!props.autoFocus;
		}

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
		return emptyObject;
	},
	getChildHostContext(parentHostContext: any, type: any) {
		return emptyObject;
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
			}

			if (propName === 'style') {
				// Return a diff between the new and the old styles
				const styleDiffs = shallowDiff(oldProps.style, newProps.style);
				const finalStyles = styleDiffs.reduce((acc: any, styleName) => {
					// Style marked to be unset
					if (!newProps.style[styleName]) acc[styleName] = '';
					else acc[styleName] = newProps.style[styleName];

					return acc;
				}, {});

				setStyles(domElement, finalStyles);
			} else if (
				newProps[propName] ||
				typeof newProps[propName] === 'number'
			) {
				if (isEventName(propName)) {
					const eventName = propName.toLowerCase().replace('on', '');
					domElement.removeEventListener(
						eventName,
						oldProps[propName]
					);
					domElement.addEventListener(eventName, newProps[propName]);
				} else {
					domElement.setAttribute(propName, newProps[propName]);
				}
			} else {
				if (isEventName(propName)) {
					const eventName = propName.toLowerCase().replace('on', '');
					domElement.removeEventListener(
						eventName,
						oldProps[propName]
					);
				} else {
					domElement.removeAttribute(propName);
				}
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

export const ReactTinyDOM = {
	render(
		element:
			| boolean
			| React.ReactChild
			| React.ReactFragment
			| React.ReactPortal
			| null
			| undefined,
		callback: () => void | null | undefined
	) {
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

		TinyDOMRenderer.updateContainer(element, root, null, callback);

		return domContainer.innerHTML;
	}
};
