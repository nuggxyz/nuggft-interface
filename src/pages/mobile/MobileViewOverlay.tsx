import { animated } from '@react-spring/web';
import React, { useCallback } from 'react';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { NLStyleSheetCreator } from '@src/lib';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import useBlur from '@src/hooks/useBlur';
import ViewingNuggPhone from '@src/components/nugg/ViewingNugg/ViewingNuggPhone';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        // justifyContent: 'space-between',
        // alignItems: 'space-between',
        height: '100%',
    },
    nuggDexContainer: {
        display: 'flex',
        width: '40%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tokenContainer: {
        display: 'flex',
        width: '40%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'scroll',
    },
});

export default () => {
    const navigate = useNavigate();

    const onClick = useCallback(() => navigate(-1), [navigate]);

    const style = useAnimateOverlayBackdrop(true, {
        zIndex: 998,
    });

    const modalStyle = useBlur([]);

    return (
        <animated.div style={{ ...styles.container, ...style, ...modalStyle }}>
            <ViewingNuggPhone
                MobileBackButton={React.memo(() => (
                    <Button
                        leftIcon={
                            <IoChevronBackOutline color={lib.colors.nuggBlueText} size="25" />
                        }
                        onClick={onClick}
                        buttonStyle={{
                            background: lib.colors.transparentWhite,
                            borderRadius: lib.layout.borderRadius.large,
                            padding: '0.4rem',
                        }}
                        textStyle={{
                            fontFamily: lib.layout.font.sf.light,
                            color: lib.colors.nuggBlueText,
                            fontSize: lib.fontSize.h6,
                        }}
                    />
                ))}
            />
        </animated.div>
    );
};
