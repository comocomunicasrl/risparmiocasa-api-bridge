import * as React from 'react';
import { FixedSizeList as List } from 'react-window';

const RowFactory = (children) => ({ index, style }: { index: number, style: React.CSSProperties }) => {
    // eslint-disable-next-line react/prop-types
    return React.cloneElement(children[index], {
        // eslint-disable-next-line react/prop-types
        style: style,
    });
};


const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
    // eslint-disable-next-line react/prop-types
    const { children, ...other } = props as any;
    // eslint-disable-next-line react/prop-types
    const itemCount = Array.isArray(children) ? children.length : 0;
    const itemSize = 36;

    return (
        // @ts-ignore
        <div ref={ref}>
            <div {...other}>
                <List
                    height={250}
                    width={335}
                    itemSize={itemSize}
                    itemCount={itemCount}
                    role="listbox"
                >
                    {RowFactory(children)}
                </List>
            </div>
        </div>
    );
});

export default ListboxComponent;
