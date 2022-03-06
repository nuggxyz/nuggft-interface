import React, { CSSProperties, FunctionComponent, useState } from 'react';
import { animated, useSpring, useTransition, config } from '@react-spring/web';

import { isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import AppState from '@src/state/app';
import Text from '@src/components/general/Texts/Text/Text';

import styles from './HappyTabber.styles';

export type HappyTabberItem = {
    label: string;
    comp: ({ isActive: boolean }) => JSX.Element;
};

type Props = {
    items: HappyTabberItem[];
    defaultActiveIndex?: number;
    containerStyle?: CSSProperties;
    bodyStyle?: CSSProperties;
    headerTextStyle?: CSSProperties;
};

const WIDTH = 350;

const HappyTabber: FunctionComponent<Props> = ({
    items,
    defaultActiveIndex = 0,
    containerStyle,
    bodyStyle,
    headerTextStyle,
}) => {
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
    const screenType = AppState.select.screenType();

    const selectionIndicatorSpring = useSpring({
        from: { x: 0, opacity: 1, ...styles.selectionIndicator },
        to: {
            opacity: 1,
            x: activeIndex * ((WIDTH - 8) / items.length),
        },
        config: config.default,
    });

    const tabFadeTransition = useTransition(items[activeIndex]?.comp, {
        from: {
            padding: 'inherit',
            opacity: 0,
            position: 'absolute',
            height: '100%',
            width: '100%',
            display: 'flex',
        },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: config.default,
    });

    return (
        <div
            style={{
                ...styles.wrapperContainer,
                ...(screenType === 'phone' && styles.wrapperMobile),
                minWidth: screenType === 'phone' ? '100%' : `${WIDTH}px`,
            }}
        >
            {!isUndefinedOrNullOrArrayEmpty(items) && items.length > 1 && (
                <div
                    style={{
                        ...styles.header,
                        ...(screenType === 'phone'
                            ? { marginTop: '.5rem' }
                            : { marginBottom: '.5rem' }),
                        width: `${WIDTH}px`,
                    }}
                >
                    <animated.div
                        style={{
                            width: `${(WIDTH - 8) / items.length}px`,
                            ...selectionIndicatorSpring,
                        }}
                    />
                    {items.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                width: `${WIDTH / items.length}px`,
                                ...styles.headerTextContainer,
                            }}
                            onClick={() => setActiveIndex(index)}
                        >
                            <Text
                                textStyle={{
                                    ...headerTextStyle,
                                    ...(index === activeIndex
                                        ? styles.headerTextBold
                                        : screenType === 'phone'
                                        ? styles.headerTextMobile
                                        : styles.headerText),
                                }}
                            >
                                {item.label}
                            </Text>
                        </div>
                    ))}
                </div>
            )}
            <div style={{ ...bodyStyle,...styles.body,  }}>
                {tabFadeTransition((styles, Item) => (
                    //@ts-ignore
                    <animated.div style={styles}>{Item && <Item isActive={true} />}</animated.div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(HappyTabber);
