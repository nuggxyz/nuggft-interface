import React, { CSSProperties } from 'react';
import { IoInformationCircle } from 'react-icons/io5';

import { Page } from '@src/interfaces/nuggbook';
import client from '@src/client';
import Button from '@src/components/general/Buttons/Button/Button';

export default ({ to, style, text }: { to: Page; style?: CSSProperties; text: string }) => {
    const openNuggBook = client.nuggbook.useOpenNuggBook();

    return (
        <Button
            onClick={(event) => {
                event?.stopPropagation();
                openNuggBook(to);
            }}
            leftIcon={
                <IoInformationCircle
                    size={15}
                    color="rgba(255,255,255, .8)"
                    // className="info-clicker "
                    style={{ marginRight: '3px', ...style }}
                />
            }
            className="mobile-pressable-div"
            label={text}
            hoverStyle={{ filter: 'brightness(1)' }}
            buttonStyle={{ background: 'transparent', paddingTop: 0 }}
            textStyle={{ color: 'rgba(255,255,255, .8)' }}
            size="small"
        />
        // <div
        //     className="mobile-pressable-div"
        //     onClick={() => openNuggBook(to)}
        // style={{display:}}
        //     // divStyle={{ padding: 0, borderRadius: 0 }}
        //     aria-hidden="true"
        // >

        // </div>
    );
};
