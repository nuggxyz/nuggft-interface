import React from 'react';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';

const WhatIsDefi: NuggBookPage = ({ setPage }) => {
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
                Welcome to Nuggft V1
            </Text>
            <Text
                size="medium"
                textStyle={{ padding: '15px', fontFamily: lib.layout.font.sf.regular }}
            >
                a decentralized art project on ethereum
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

export default WhatIsDefi;
