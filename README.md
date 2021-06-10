# react-xml

this is a small react renderer which allows you to render arbitrary XML using JSX.

# usage

see [test/renderer.spec.tsx](test/renderer.spec.tsx)

```tsx
import renderXML, { XML, xmlElement } from 'react-xml';

// you can create XML elements using the xmlElement helper:
const Foo = xmlElement('foo');

const fooBarJsx = <Foo asdf="123">bar</Foo>;

// or use the XML proxy instead:
const fooBarJsx2 = <XML.foo asdf="123">bar</XML.foo>;

// render your JSX to an xml string:

const fooBar = renderXML(fooBarJsx);
const fooBar2 = renderXml(fooBarJsx2);

console.assert(fooBar === fooBar2); // true
```

# why

if you've ever thought of rendering XML with React, you might have realized you can use react-dom to render your JSX to a string instead of into a dom node:

```tsx
import React from 'react';
import ReactDomServer from 'react-dom/server';

const jsx = <p>I'm a string!</p>;

const xml = ReactDomServer.renderToStaticMarkup(jsx);

console.log(xml); // <p>I&#x27;m a string!</p>
```

okay, cool. now let's start writing some non-html content like, say, an RSS feed:

```tsx
import React from 'react';
import ReactDomServer from 'react-dom/server';

const jsx = <rss version="2.0"></rss>;
//                             ~~~~~~
// error TS2339: Property 'rss' does not exist on type 'JSX.IntrinsicElements'.

const xml = ReactDomServer.renderToStaticMarkup(jsx);

console.log(xml);
```

oops - typescript expects all lowercase components to be real HTML elements, as defined by `JSX.IntrinsicElements` from `@types/react`.

we can work around this by defining our own react component:

```tsx
import React from 'react';
import ReactDomServer from 'react-dom/server';

const Rss = (props: Record<string, any>) => React.createElement('rss', props);

const jsx = <Rss version="2.0"></Rss>;

const xml = ReactDomServer.renderToStaticMarkup(jsx);

console.log(xml); // <rss version="2.0"></rss>
```

great, now we can build out the rest of our xml using this approach:

```tsx
import React from 'react';
import ReactDomServer from 'react-dom/server';

const xmlElement = (name: string) => (props: Record<string, any>) =>
	React.createElement(name, props);

const Rss = xmlElement('rss');
const Channel = xmlElement('channel');
const Title = xmlElement('title');
const Description = xmlElement('description');
const Link = xmlElement('link');
const Copyright = xmlElement('copyright');
const LastBuildDate = xmlElement('lastBuildDate');
const PubDate = xmlElement('pubDate');
const Ttl = xmlElement('ttl');
const Item = xmlElement('item');
const Guid = xmlElement('guid');

const jsx = (
	<Rss version="2.0">
		<Channel>
			<>
				<Title>RSS Title</Title>
				<Description>This is an example of an RSS feed</Description>
				<Link>http://www.example.com/main.html</Link>
				<Copyright>2020 Example.com All rights reserved</Copyright>
				<LastBuildDate>Mon, 06 Sep 2010 00:01:00 +0000 </LastBuildDate>
				<PubDate>Sun, 06 Sep 2009 16:20:00 +0000</PubDate>
				<Ttl>1800</Ttl>

				<Item>
					<Title>Example entry</Title>
					<Description>
						Here is some text containing an interesting Description.
					</Description>
					<Link>http://www.example.com/blog/post/1</Link>
					<Guid isPermaLink="false">
						7bd204c6-1655-4c27-aeee-53f933c5395f
					</Guid>
					<PubDate>Sun, 06 Sep 2009 16:20:00 +0000</PubDate>
				</Item>
			</>
		</Channel>
	</Rss>
);

const xml = ReactDomServer.renderToStaticMarkup(jsx);

console.log(xml);
```

this code doesn't trigger any typescript type errors! however, if we run it, we get a runtime error:

```
Error: link is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.
```

`<link>`, in HTML, is a [void element](https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-element), meaning it can't accept children.

this shouldn't matter to us, because we're not writing HTML, we're writing XML. but react-dom has [special checks](https://github.com/facebook/react/blob/c1536795cae5101041ef50a59ae29119aa1c2bf4/packages/react-dom/src/shared/omittedCloseTags.js#L21) to prevent us from writing invalid HTML which can't be disabled. if we want to create non-HTML from JSX, we need a different renderer.

# prior art

react-xml is a stripped-down fork of [react-tiny-dom](https://github.com/jiayihu/react-tiny-dom/), and uses [jsdom](https://github.com/jsdom/jsdom) behind-the-scenes.
