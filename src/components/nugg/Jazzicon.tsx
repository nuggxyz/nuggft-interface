import React, { FC, useEffect, useRef } from 'react';
import jazziconer from '@metamask/jazzicon';

const Jazzicon: FC<{
    address: string;
    size: number;
    className?: string;
    style?: React.CSSProperties;
}> = ({ address, size = 35, className, style }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const { current } = ref;
        if (current && address) {
            const jazzman = jazziconer(size, parseInt(address.slice(2, 10), 16));

            if (className) jazzman.classList.add(className);
            current.appendChild(jazzman);

            return () => {
                try {
                    current.removeChild(jazzman);
                } catch (e) {
                    // console.log('jazzman', e);
                }
            };
        }

        return () => undefined;
    }, [ref, address, size]);

    return (
        <div
            className={className}
            ref={ref}
            style={{
                height: `${size}px`,
                width: `${size}px`,
                borderRadius: '22.5%',
                ...style,
            }}
        />
    );
};

export default Jazzicon;
