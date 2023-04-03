import client from '@src/client';
import Flyout from '@src/components/general/Flyout/Flyout';
import React, { CSSProperties, FunctionComponent } from 'react';
import TokenViewer from '@src/components/nugg/TokenViewer';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import Button from '@src/components/general/Buttons/Button/Button';
import { TbHistory } from 'react-icons/tb';
import useDimensions from '@src/client/hooks/useDimensions';
import lib from '@src/lib';

type Props = { style: CSSProperties };

const Recents: FunctionComponent<Props> = ({ style }) => {
	const recents = client.recents.useRecents();
	const { gotoViewingNugg } = useViewingNugg();
	const [screen] = useDimensions();
	return (
		<Flyout
			button={
				<div
					style={{
						opacity: recents.length > 0 ? 1 : 0,
						background: lib.colors.nuggBlueSemiTransparent,
						padding: '.5rem .5rem .1rem .5rem',
						borderRadius: '100%',
					}}
				>
					<TbHistory color="white" style={{ margin: 0 }} />
				</div>
			}
			float="right"
			top={35}
			containerStyle={{ ...style }}
			triggerWidth="175px"
			openOnHover={screen === 'desktop'}
			style={{ width: '200px', maxHeight: '400px', overflow: 'scroll' }}
		>
			{recents.map((recent) => (
				<Button
					className="mobile-pressable-div-shallow"
					key={recent}
					onClick={() => gotoViewingNugg(recent)}
					label={recent.toPrettyId()}
					buttonStyle={{ justifyContent: 'space-between' }}
					rightIcon={
						<TokenViewer tokenId={recent} style={{ height: '30px', width: '30px' }} />
					}
				/>
			))}
		</Flyout>
	);
};

export default Recents;
