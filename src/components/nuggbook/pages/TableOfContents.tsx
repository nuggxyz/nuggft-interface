import React from 'react';
import { BsCircle, BsCheckCircleFill } from 'react-icons/bs';
import { IoIosArrowForward } from 'react-icons/io';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page, NuggBookPageProps } from '@src/interfaces/nuggbook';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';

const ListItem = ({
    text,
    onClick,
    visited,
}: {
    text: string;
    onClick: () => void;
    visited: boolean;
}) => {
    return (
        <Button
            aria-hidden="true"
            buttonStyle={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '.7rem',
            }}
            onClick={onClick}
            rightIcon={
                <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <div
                            style={{
                                marginRight: '.5rem',
                                alignItems: 'center',
                                display: 'flex',
                            }}
                        >
                            {visited ? (
                                <BsCheckCircleFill color={lib.colors.green} />
                            ) : (
                                <BsCircle color={lib.colors.grey} />
                            )}
                        </div>

                        <Text
                            textStyle={{
                                ...lib.layout.presets.font.main.regular,
                                fontSize: '20px',
                            }}
                        >
                            {text}
                        </Text>
                    </div>
                    <IoIosArrowForward color={lib.colors.darkerGray} />
                </>
            }
        />
    );
};

const ListItemGroup = ({
    header,
    items,
    setPage,
}: {
    header: string;
    items: ListItemDescription[];
    setPage: NuggBookPageProps['setPage'];
}) => {
    const visits = client.nuggbook.useVisits();

    const id = React.useId();

    return (
        <div
            key={id}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                width: '100%',
                marginTop: '1rem',
            }}
        >
            <Text size="large">{header}</Text>
            {items.map((x, index) => (
                <ListItem
                    key={`${id}-${index}`}
                    text={x.header}
                    onClick={() => setPage(x.page)}
                    visited={visits[x.page]}
                />
            ))}
        </div>
    );
};
type ListItemDescription = {
    header: string;
    page: Page;
};

const TableOfContents: NuggBookPage = ({ setPage, clear }) => {
    // const weeds: ListItemDescription[] = [
    //     {
    //         header: 'what are dynamic items?',
    //         page: Page.WhatIsDefi,
    //     },
    //     {
    //         header: 'where are the images stored?',
    //         page: Page.WhatIsAWallet,
    //     },
    // ];

    const upAndRunning: ListItemDescription[] = [
        {
            header: 'the rundown',
            page: Page.TheRundown,
        },
        {
            header: 'set up a wallet',
            page: Page.SetUpAWallet,
        },
    ];

    // const wut: ListItemDescription[] = [
    //     {
    //         header: 'what is a wallet?',
    //         page: Page.WhatIsDefi,
    //     },
    //     {
    //         header: 'what is an nft?',
    //         page: Page.WhatIsAnNFT,
    //     },
    //     {
    //         header: 'what is defi?',
    //         page: Page.WhatIsDefi,
    //     },
    // ];
    // const defi: ListItemDescription[] = [
    //     {
    //         header: 'what is defi',
    //         page: Page.WhatIsDefi,
    //     },
    //     {
    //         header: 'what is a wallet',
    //         page: Page.WhatIsAWallet,
    //     },
    // ];

    // const nft: ListItemDescription[] = [
    //     {
    //         header: 'what is an nft',
    //         page: Page.WhatIsAnNFT,
    //     },
    // ];

    return (
        <div
            style={{
                // justifyContent: 'center',
                // alignItems: 'center',
                // display: 'flex',
                // flexDirection: 'column',
                // height: dim?.height,
                overflow: 'scroll',
            }}
        >
            <Text
                size="larger"
                textStyle={{ padding: '10px', fontWeight: lib.layout.fontWeight.semibold }}
            >
                welcome to nuggft
            </Text>

            <ListItemGroup header="get up and running" items={upAndRunning} setPage={setPage} />

            {/* <ListItemGroup header="intro to defi" items={defi} setPage={setPage}  /> */}

            {/* <ListItemGroup header="into the weeds" items={weeds} setPage={setPage} />

            <ListItemGroup header="lol wut" items={wut} setPage={setPage} /> */}

            <Button
                label="[For Testing] Clear History"
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    marginTop: '20px',
                    background: lib.colors.red,
                    color: lib.colors.white,
                }}
                onClick={() => {
                    clear();
                }}
            />

            <div style={{ marginTop: 150 }} />
        </div>
    );
};

export default TableOfContents;
