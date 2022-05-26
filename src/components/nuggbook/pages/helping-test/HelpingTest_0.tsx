import React from 'react';
import { IoIosArrowDropleftCircle } from 'react-icons/io';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';

const HelpingTest_0: NuggBookPage = ({ setPage }) => {
    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
            }}
        >
            <Text
                size="larger"
                textStyle={{
                    marginTop: 50,
                    textAlign: 'center',
                    fontWeight: lib.layout.fontWeight.thicc,
                }}
            >
                2️⃣ 💸 <span style={{ paddingLeft: 5 }}>get some ethereum</span>
            </Text>
            <div style={{ padding: '10px 0px' }}>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.regular, padding: 20 }}
                >
                    <span
                        style={{
                            alignItems: 'center',
                            padding: '.3rem .5rem',
                            display: 'inline-flex',
                            justifyContent: 'flex-start',
                            background: lib.colors.orange,
                            color: 'white',
                            fontSize: '16px',
                            borderRadius: lib.layout.borderRadius.large,
                            ...lib.layout.presets.font.main.semibold,
                        }}
                    >
                        <span>helping us test?</span>
                    </span>
                </Text>
                <div
                    style={{
                        // marginTop: 10,
                        padding: 20,
                        borderRadius: lib.layout.borderRadius.medium,
                        // border: `${lib.colors.primaryColor} solid 3px`,
                        boxShadow: lib.layout.boxShadow.basic,
                    }}
                >
                    <Text
                        size="large"
                        textStyle={{
                            ...lib.layout.presets.font.main.regular,
                            // margin: '15px 0px',
                            fontWeight: lib.layout.fontWeight.semibold,
                            // marginBottom: 10,
                        }}
                    >
                        ask us for some testnet ethereum
                    </Text>
                    <Text
                        size="large"
                        textStyle={{
                            ...lib.layout.presets.font.main.regular,
                            padding: 10,
                            fontWeight: lib.layout.fontWeight.semibold,
                            // marginBottom: 10,
                        }}
                    >
                        you must switch to the{' '}
                        <b style={{ fontWeight: lib.layout.fontWeight.relative.bolder }}>rinkeby</b>{' '}
                        blockchain
                    </Text>
                    <Text
                        size="small"
                        textStyle={{
                            ...lib.layout.presets.font.main.regular,
                            // marginTop: '10px',
                            fontWeight: lib.layout.fontWeight.thicc,
                            // marginBottom: 10,
                        }}
                    >
                        ps: you rock 💙
                    </Text>
                </div>
            </div>

            <Button
                label="give feedback"
                onClick={() => {
                    setPage(Page.Feedback);
                }}
            />

            <Button
                buttonStyle={{
                    background: lib.colors.gradient2,
                    color: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                    marginBottom: '.4rem',
                    backgroundColor: lib.colors.white,
                    // width: '13rem',
                    alignItems: 'center',
                }}
                label="back"
                leftIcon={
                    <IoIosArrowDropleftCircle
                        color="white"
                        style={{ marginRight: '.3rem' }}
                        size={20}
                    />
                }
                onClick={() => setPage(Page.TableOfContents)}
            />
        </div>
    );
};

export default HelpingTest_0;
