import React, { FunctionComponent } from 'react';
import { IoIosArrowDropleftCircle } from 'react-icons/io';

import { Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import client from '@src/client';

type Props = { page?: Page };

const NuggBookBackButton: FunctionComponent<Props> = ({ page = Page.TableOfContents }) => {
    const setPage = client.nuggbook.useOpenNuggBook();
    return (
        <Button
            buttonStyle={{
                backgroundColor: lib.colors.transparentWhite,
                color: lib.colors.primaryColor,
                borderRadius: lib.layout.borderRadius.large,
                marginBottom: '.4rem',
                // width: '13rem',
                alignItems: 'center',
            }}
            label="back"
            leftIcon={
                <IoIosArrowDropleftCircle
                    color={lib.colors.primaryColor}
                    style={{ marginRight: '.3rem' }}
                    size={20}
                />
            }
            onClick={() => setPage(page, false)}
        />
    );
};

export default NuggBookBackButton;
