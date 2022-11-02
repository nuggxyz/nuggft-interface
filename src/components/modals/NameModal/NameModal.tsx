import { animated } from '@react-spring/web';
import Button from '@src/components/general/Buttons/Button/Button';
import { useRegisterEnsName } from '@src/components/mobile/NameModalMobile';
import lib from '@src/lib';
import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';
import { IoIosArrowDropleftCircle } from 'react-icons/io';

type Props = Record<string, never>;

const NameModal: FunctionComponent<Props> = () => {
	const [
		,
		,
		,
		,
		stage,
		setStage,
		TrippleFinalize,
		PickAName,
		Home,
		// localCurrencyPref,
		// setLocalCurrencyPref,
	] = useRegisterEnsName();
	const Mem = React.useCallback(
		(_stage: typeof stage) => {
			return _stage === 'finalize' ? TrippleFinalize : _stage === 'pick' ? PickAName : Home;
		},
		[Home, PickAName, TrippleFinalize],
	);

	return (
		<animated.div
			style={{
				// position: 'absolute',
				display: 'flex',
				justifyContent: 'center',
				width: '100%',
				// margin: 20,
			}}
		>
			<animated.div
				style={
					{
						// ...sty,
					}
				}
			>
				{Mem(stage)}

				{stage !== 'home' && (
					<Button
						className="mobile-pressable-div-shallow"
						size="small"
						buttonStyle={{
							backgroundColor: lib.colors.transparentWhite,
							boxShadow: lib.layout.boxShadow.basic,
							// color: lib.colors.textColor,
							borderRadius: lib.layout.borderRadius.large,
							marginBottom: '.4rem',
							alignItems: 'center',
							position: 'absolute',
							top: '1rem',
							left: '1rem',
						}}
						leftIcon={
							<IoIosArrowDropleftCircle
								// color={lib.colors.textColor}
								style={{ marginRight: '.3rem' }}
								size={20}
							/>
						}
						label={t`back`}
						onClick={() => (stage === 'finalize' ? setStage('pick') : setStage('home'))}
					/>
				)}
			</animated.div>
		</animated.div>
	);
};

export default NameModal;
