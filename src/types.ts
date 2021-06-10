import React, { ReactNode } from 'react';

export type AttributeTypes = string | number;
type ChildrenInterface = { children: ReactNode };
type PropsInterface = { [key: string]: string | number };
export type ElementProps = ChildrenInterface | PropsInterface;
export type XMLElement = React.FC<ElementProps>;
