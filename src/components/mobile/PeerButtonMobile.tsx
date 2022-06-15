import React, { CSSProperties } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import web3 from '@src/web3';

const Img = ({
    src,
    height = 50,
    width = 50,
    style = {
        borderRadius: '22.5%',
        objectFit: 'cover',
    },
}: {
    src: string;
    height?: number;
    width?: number;
    style?: CSSProperties;
}) => {
    return React.createElement('img', { src, height, width, style });
};

const PeerButtonMobile = React.memo<{
    text: string;
    color?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}>(({ text, color = lib.colors.primaryColor, onClick }) => {
    const priorityPeer = web3.hook.usePriorityPeer();

    return (
        <div
            className="mobile-pressable-div"
            style={{
                background: color,
                color: 'white',
                borderRadius: lib.layout.borderRadius.medium,
                boxShadow: lib.layout.boxShadow.dark,
                width: 'auto',
                display: 'flex',
                padding: 10,
                alignItems: 'center',
            }}
            onClick={onClick}
            aria-hidden="true"
            role="button"
        >
            {priorityPeer && <Img src={priorityPeer?.icon} />}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'left',
                    flexDirection: 'column',
                    // width: '100%',
                    marginLeft: 10,
                }}
            >
                <Text textStyle={{ color: lib.colors.white, fontSize: 20 }}>{text}</Text>
                <Text
                    textStyle={{
                        color: lib.colors.white,
                        fontSize: 30,
                    }}
                >
                    {priorityPeer?.name}
                </Text>
            </div>
        </div>
    );
});

export default PeerButtonMobile;
