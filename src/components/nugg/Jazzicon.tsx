import React, { FC, useEffect, useRef } from 'react';
import jazziconer from '@metamask/jazzicon';

const Jazzicon: FC<{ address: string; size: number }> = ({ address, size = 35 }) => {
    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        const current = ref.current;
        if (current && address) {
            const jazzman = jazziconer(size, parseInt(address.slice(2, 10), 16));
            current.appendChild(jazzman);

            return () => {
                try {
                    current.removeChild(jazzman);
                } catch (e) {
                    console.log('jazzman', e);
                }
            };
        }
    }, [ref, address]);

    return <div ref={ref} style={{ height: `${size}px`, width: `${size}px` }} />;
};

export default Jazzicon;
