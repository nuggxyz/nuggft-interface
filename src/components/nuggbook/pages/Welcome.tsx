import React from 'react';
import { useSpring, animated, config, a } from '@react-spring/web';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import packages from '@src/packages';
import client from '@src/client';
import useDimensions from '@src/client/hooks/useDimensions';

const items = [
    'no more scams',
    // 'no more gimmics',
    'no more mints',
    // 'no more luck',
    // 'no more phishing',
    // 'no more trust',
    // 'no more roadmaps',
    // 'no more lottery',
    'no more monkeys',
    'no more bullshit',
].map((val, index) => ({ val, index }));

const layoutConfig = {
    desktop: {
        spring: '52px',
        spring2: '166px',
        spring3: '18px',
        size: 'larger' as const,
        width: '50%',
    },
    tablet: {
        spring: '52px',
        spring2: '170px',
        spring3: '18px',
        size: 'larger' as const,
        width: '50%',
    },
    phone: {
        spring: '31px',
        spring2: '103px',
        spring3: '12px',
        size: 'medium' as const,
        width: '100%',
    },
};

const Start: NuggBookPage = ({ setPage, close }) => {
    const { screen } = useDimensions();
    const spring = useSpring({
        from: {
            width: '0px',
            opacity: 0,
        },
        to: {
            width: layoutConfig[screen].spring,
            opacity: 1,
        },
        delay: 700 + items.length * 1000,
        config: config.molasses,
    });

    const spring2 = useSpring({
        from: {
            width: layoutConfig[screen].spring2,
            opacity: 1,
        },
        to: {
            opacity: 0,
            width: '0px',
        },

        delay: 700 + items.length * 1000,
        config: config.molasses,
    });

    const spring3 = useSpring({
        from: {
            width: layoutConfig[screen].spring3,
            opacity: 1,
        },
        to: {
            width: '0px',
            opacity: 0,
        },
        delay: 700 + items.length * 1000,
        config: config.molasses,
    });

    const transition = packages.spring.useTransition(items, {
        config: config.molasses, // { duration: 1000 },
        enter: { width: 200 },
        from: { width: 0 },
        delay: (x: string) => {
            return Number((x as `${number}-welcome-transition`).split('-')[0]) * 1000 + 1000;
        },
        keys: (x) => `${x.index}-welcome-transition`,
    });

    const spring4 = useSpring({
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        },
        delay: 500 + 1500 + items.length * 1000,
        config: config.default,
    });

    const setInit = client.nuggbook.useSetInit();

    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Text
                size={layoutConfig[screen].size}
                textStyle={{ padding: '15px', ...lib.layout.presets.font.main.regular }}
            >
                welcome to{' '}
                <animated.span
                    style={{
                        overflow: 'hidden',
                        display: 'inline-flex',
                        // height: '1rem',
                        flexWrap: 'nowrap',
                        whiteSpace: 'nowrap',
                        // lineHeight: 1,
                        ...spring2,
                    }}
                >
                    the future of
                </animated.span>
                n
                <animated.span
                    style={{
                        overflow: 'hidden',
                        display: 'inline-flex',

                        ...spring,
                    }}
                >
                    ugg
                </animated.span>
                ft
                <animated.span
                    style={{
                        flexWrap: 'nowrap',
                        lineHeight: 1,

                        overflow: 'hidden',
                        display: 'inline-flex',

                        ...spring3,
                    }}
                >
                    s
                </animated.span>
            </Text>
            <animated.div
                style={{
                    width: layoutConfig[screen].width,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                }}
            >
                {transition(({ width, ...style }, kid, _, index) => (
                    <a.div
                        key={index}
                        style={{
                            width,
                            overflow: 'hidden',

                            ...style,
                        }}
                    >
                        <a.div
                            style={{
                                width: 200,
                                // display: 'inline-flex',
                                // flexWrap: 'nowrap',
                            }}
                        >
                            <Text>{kid.val}</Text>
                        </a.div>
                    </a.div>
                ))}
            </animated.div>
            {/* <Button
                label="next"
                buttonStyle={{
                    background: lib.colors.gradient,
                    color: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                    marginBottom: '.8rem',
                    backgroundColor: lib.colors.white,
                    // width: '5rem',
                }}
                onClick={() => setPage(Page.TableOfContents)}
            /> */}

            {/* <Button
                buttonStyle={{
                    background: lib.colors.gradient2,
                    color: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                    marginBottom: '.4rem',
                    backgroundColor: lib.colors.white,
                    width: '13rem',
                }}
                label="give me the rundown"
                onClick={() => setPage(Page.Welcome)}
            /> */}

            <animated.div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 10,
                    ...spring4,
                }}
            >
                <Button
                    className="mobile-pressable-div"
                    label="i got time ⌛️"
                    onClick={() => {
                        setInit();
                        setPage(Page.TableOfContents);
                    }}
                    size="large"
                    buttonStyle={{
                        color: lib.colors.white,
                        boxShadow: lib.layout.boxShadow.basic,
                        padding: '.7rem 1.3rem',
                        background: lib.colors.gradient3,
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: 15,
                    }}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <Button
                    className="mobile-pressable-div"
                    label="imma need a tldr 🤠"
                    onClick={() => {
                        setInit();

                        setPage(Page.Setup_0);
                    }}
                    size="large"
                    buttonStyle={{
                        color: lib.colors.white,
                        boxShadow: lib.layout.boxShadow.basic,
                        padding: '.7rem 1.3rem',

                        background: lib.colors.gradient2,
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: 15,
                    }}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <Button
                    className="mobile-pressable-div"
                    label={"i'll figure it out 💪"}
                    onClick={() => {
                        setInit();
                        close();
                    }}
                    size="large"
                    buttonStyle={{
                        color: lib.colors.white,
                        padding: '.7rem 1.3rem',
                        boxShadow: lib.layout.boxShadow.basic,
                        background: lib.colors.gradient,
                        borderRadius: lib.layout.borderRadius.large,
                    }}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
            </animated.div>
        </div>
    );
};

export default Start;
