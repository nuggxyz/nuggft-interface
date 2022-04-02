// eslint-disable-next-line max-classes-per-file
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import Decimal from 'decimal.js-light';
import numbro from 'numbro';

import { fromEth, toEth, TWO_128, TWO_96, ETH_ONE } from '@src/lib/conversion';
import { toGwei } from '@src/lib/index';

// eslint-disable-next-line no-use-before-define
export type Fractionish = BigNumberish | Fraction;

export class Fraction {
    public num: BigNumber;

    public den: BigNumber;

    public static ZERO = new Fraction(BigNumber.from(0));

    public static ONE = new Fraction(BigNumber.from(1));

    constructor(num: BigNumberish, den: BigNumberish = BigNumber.from(1)) {
        this.num = BigNumber.from(num);
        this.den = BigNumber.from(den);
    }

    get rat() {
        return this.num.div(this.den);
    }

    get decimal() {
        return new Decimal(this.num.toString()).div(new Decimal(this.den.toString()));
    }

    get number() {
        return this.decimal.toNumber();
    }

    get bignumber() {
        return this.num.mul(ETH_ONE).div(this.den);
    }

    public add(other: Fractionish): Fraction {
        const otherParsed = Fraction.tryParseFraction(other);
        if (this.den.eq(otherParsed.num)) {
            return new Fraction(this.num.add(otherParsed.num), this.den);
        }
        return new Fraction(
            this.num.mul(otherParsed.den).add(otherParsed.num.mul(this.den)),
            this.den.mul(otherParsed.den),
        );
    }

    public sub(other: Fractionish): Fraction {
        const otherParsed = Fraction.tryParseFraction(other);
        if (this.den.eq(otherParsed.num)) {
            return new Fraction(this.num.sub(otherParsed.num), this.den);
        }
        return new Fraction(
            this.num.mul(otherParsed.den).sub(otherParsed.num.mul(this.den)),
            this.den.mul(otherParsed.den),
        );
    }

    public lt(other: Fractionish): boolean {
        const otherParsed = Fraction.tryParseFraction(other);
        return this.num.mul(otherParsed.den).lt(otherParsed.num.mul(this.den));
    }

    public eq(other: Fractionish): boolean {
        const otherParsed = Fraction.tryParseFraction(other);
        return this.num.mul(otherParsed.den).eq(otherParsed.num.mul(this.den));
    }

    public gt(other: Fractionish): boolean {
        const otherParsed = Fraction.tryParseFraction(other);
        return this.num.mul(otherParsed.den).gt(otherParsed.num.mul(this.den));
    }

    public multiply(other: Fractionish): Fraction {
        const otherParsed = Fraction.tryParseFraction(other);
        return new Fraction(this.num.mul(otherParsed.num), this.den.mul(otherParsed.den));
    }

    public divide(other: Fractionish): Fraction {
        const otherParsed = Fraction.tryParseFraction(other);
        return new Fraction(this.num.mul(otherParsed.den), this.den.mul(otherParsed.num));
    }

    public asFraction(): Fraction {
        return new Fraction(this.num, this.den);
    }

    protected static tryParseFraction(fractionish: Fractionish): Fraction {
        if (
            fractionish instanceof BigNumber ||
            typeof fractionish === 'number' ||
            typeof fractionish === 'string'
        )
            return new Fraction(fractionish);

        try {
            const unsafe = fractionish as unknown;
            if ((unsafe as Fraction).num && (unsafe as Fraction).den)
                return fractionish as Fraction;

            console.log({ unsafe });
            throw new Error('Could not parse fraction');
        } catch (e) {
            throw new Error('Could not parse fraction');
        }
    }
}

export class Fraction2x128 extends Fraction {
    constructor(num: BigNumberish) {
        super(BigNumber.from(num), TWO_128);
    }
}

export class Fraction2x96 extends Fraction {
    constructor(num: BigNumberish) {
        super(BigNumber.from(num), TWO_96);
    }
}

export class EthInt extends Fraction {
    public static ZERO = new EthInt(BigNumber.from(0));

    public static ONE = new EthInt(BigNumber.from(1));

    constructor(value: BigNumberish) {
        super(BigNumber.from(value), ETH_ONE);
    }

    public static fromNuggftV1Agency(value: BigNumberish): EthInt {
        return new EthInt(BigNumber.from(value).shr(160).mask(70).mul(100000000));
    }

    public static fromNuggftV1Stake(cache: BigNumberish) {
        const bn = BigNumber.from(cache);
        return {
            shares: bn.shr(192),
            staked: bn.shr(96).mask(96),
            eps: EthInt.fromFraction(new Fraction(bn.shr(96).mask(96), bn.shr(192))),
        };
    }

    public static tryParseFrac(value: Fractionish): EthInt {
        return Fraction.tryParseFraction(value) as EthInt;
    }

    public static fromGwei(value: BigNumberish): EthInt {
        return new EthInt(toGwei(value.toString()));
    }

    public static fromEthDecimal(value: number): EthInt {
        return new EthInt(toEth(value.toFixed(18)));
    }

    public static fromEthDecimalString(value: string): EthInt {
        return new EthInt(fromEth(value));
    }

    public static fromEthString(value: string): EthInt {
        return new EthInt(toEth(value));
    }

    public static fromFraction(value: Fraction): EthInt {
        try {
            const bob = new EthInt(0);
            bob.num = value.num;
            bob.den = value.den.mul(ETH_ONE);
            return bob;
        } catch (err) {
            return EthInt.ZERO;
        }
    }

    public static fromFractionRaw(value: Fraction): EthInt {
        try {
            const bob = new EthInt(0);
            bob.num = value.num;
            bob.den = value.den.mul(ETH_ONE);
            return bob;
        } catch (err) {
            return EthInt.ZERO;
        }
    }

    // using a currency library here in case we want to add more in future
    public formatDollarAmount() {
        // round = true, // digits = 2, // num: number | undefined,
        const num = this.decimal.toNumber();
        const digits = 4;
        const round = true;

        if (num === 0) return '$0.00';
        if (!num) return '-';
        if (num < 0.001 && digits <= 3) {
            return '<$0.001';
        }

        return numbro(num).formatCurrency({
            average: round,
            mantissa: num > 1000 ? 2 : digits,
            abbreviations: {
                million: 'M',
                billion: 'B',
            },
            trimMantissa: false,

            // totalLength: num > 1000 ? 2 : digits,
        });
    }

    // using a currency library here in case we want to add more in future
    public formatAmount() {
        const num = this.decimal.toNumber();
        const digits = 3;

        if (num === 0) return '0';
        if (!num) return '-';
        if (num < 0.001) {
            return '<0.001';
        }
        return numbro(num).format({
            average: true,
            mantissa: num > 1000 ? 2 : digits,
            abbreviations: {
                million: 'M',
                billion: 'B',
            },
            trimMantissa: false,
            // totalLength: num > 1000 ? 2 : digits,
        });
    }
}

export class PairInt {
    public eth: EthInt;

    public usd: EthInt;

    constructor(eth: BigNumberish, usd: BigNumberish) {
        this.eth = new EthInt(eth);
        this.usd = new EthInt(usd);
    }
}
