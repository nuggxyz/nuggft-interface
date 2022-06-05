import React from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';

const Start: NuggBookPage = ({ setPage, close }) => {
    return (
        <div
            style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
            }}
        >
            <div
                style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                    width: '100%',
                }}
            >
                <Text size="larger" textStyle={{ padding: '15px' }}>
                    New here?
                </Text>
                <Button
                    className="mobile-pressable-div"
                    label="nah"
                    size="large"
                    buttonStyle={{
                        margin: '15px',
                        background: lib.colors.gradient,
                        color: 'white',
                        borderRadius: lib.layout.borderRadius.large,
                        // marginBottom: '.4rem',

                        backgroundColor: lib.colors.white,
                        boxShadow: lib.layout.boxShadow.basic,

                        // width: '5rem',
                    }}
                    onClick={() => {
                        console.log('CALLING CLOSE ON START PAGE');

                        close();
                    }}
                />
            </div>

            <Button
                className="mobile-pressable-div"
                size="larger"
                buttonStyle={{
                    background: lib.colors.gradient2,
                    color: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                    marginTop: '1rem',
                    padding: '.7rem 1.3rem',

                    // marginBottom: '1.5rem',
                    backgroundColor: lib.colors.white,
                    boxShadow: lib.layout.boxShadow.basic,
                    // width: '13rem',
                }}
                label={t`give me the rundown`}
                onClick={() => setPage(Page.Welcome)}
            />
        </div>
    );
};

export default Start;
