# react-xml

this is a small react renderer which allows you to render arbitrary XML using JSX.

# usage

see [test/renderer.spec.tsx](test/renderer.spec.tsx)

```tsx
import renderXML, { XML, xmlElement } from 'react-xml';

// you can create XML elements using the xmlElement helper:
const foo = xmlElement('foo');

const fooBarJsx = <foo asdf="123">bar</foo>;


// or use the XML proxy instead:
const fooBarJsx2 = <XML.foo asdf="123">bar</foo>;

// render your JSX to an xml string:

const fooBar = renderXML(fooBarJsx);
const fooBar2 = renderXml(fooBarJsx2);

console.assert(fooBar === fooBar2); // true
```

# prior art

react-xml is a stripped-down fork of [react-tiny-dom](https://github.com/jiayihu/react-tiny-dom/), and uses [jsdom](https://github.com/jsdom/jsdom) behind-the-scenes.
