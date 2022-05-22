import React from 'react';
import { useSpring, animated, config } from '@react-spring/web';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';

const Start: NuggBookPage = ({ setPage }) => {
    // console.log('ayyyeeeeeeeeee');

    const spring = useSpring({
        from: {
            width: '0px',
        },
        to: {
            width: '30px',
        },
        delay: 2000,
        config: config.molasses,
    });

    const spring2 = useSpring({
        from: {
            width: '100px',
        },
        to: {
            width: '0px',
        },
        delay: 2000,
        config: config.molasses,
    });

    const spring3 = useSpring({
        from: {
            width: '10px',
        },
        to: {
            width: '0px',
        },
        delay: 2000,
        config: config.molasses,
    });

    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Text size="larger" textStyle={{ padding: '10px' }}>
                welcome to nuggft
            </Text>

            <Text
                size="medium"
                textStyle={{ padding: '15px', fontFamily: lib.layout.font.sf.regular }}
            >
                welcome to{' '}
                <animated.span
                    style={{
                        overflow: 'hidden',
                        display: 'inline-flex',
                        height: '1rem',
                        lineHeight: 1,
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

            <Button
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
            />

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
        </div>
    );
};

export default Start;
