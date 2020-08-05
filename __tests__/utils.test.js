const {
  parseToDigitsArray,
  // add,
  // multiplyByNumber,
  convertBase,
  strip0x,
  isHex,
  requireHex,
  randomHex,
  ensure0x,
  utf8StringToHex,
  hexToUtf8String,
  asciiToHex,
  hexToAscii,
  hexToBinArray,
  hexToBin,
  hexToBytes,
  hexToDec,
  hexToField,
  // leftPadHex,
  // truncateHex,
  // resizeHex,
  binToLimbs,
  hexToBinLimbs,
  binToHex,
  hexToFieldLimbs,
  decToHex,
  // decToBin,
  binToDec,
  // decToBinLimbs,
  // fieldsToDec,
  // flattenArray,

  shaHash,
  mimcHash,
} = require('../index');

const dec = '17408914224622445472';
const hex = '0xf198e3403bdda3a0';
const bin = '1111000110011000111000110100000000111011110111011010001110100000';

describe('conversions.js tests', () => {
  describe('Functions on Hex Values', () => {
    test('hexToAscii should correctly convert hex into an ascii string (and vice versa)', () => {
      expect(
        hexToAscii('0x214024255e262a28295f2b313233343536373839302d3d3a227c3b2c2e2f3c3e3f607e23'),
      ).toEqual('!@$%^&*()_+1234567890-=:"|;,./<>?`~#');
      expect(asciiToHex('!@$%^&*()_+1234567890-=:"|;,./<>?`~#')).toEqual(
        '0x214024255e262a28295f2b313233343536373839302d3d3a227c3b2c2e2f3c3e3f607e23',
      );
      expect(hexToAscii(asciiToHex('hello'))).toEqual('hello');
    });

    test('hexToUtf8String should correctly convert hex into an utf8 string (and vice versa)', () => {
      expect(
        hexToUtf8String(
          '0x214024255e262a28295f2b313233343536373839302d3d3a227c3b2c2e2f3c3e3f607e23',
        ),
      ).toEqual('!@$%^&*()_+1234567890-=:"|;,./<>?`~#');
      expect(utf8StringToHex('!@$%^&*()_+1234567890-=:"|;,./<>?`~#')).toEqual(
        '0x214024255e262a28295f2b313233343536373839302d3d3a227c3b2c2e2f3c3e3f607e23',
      );
      expect(hexToUtf8String(utf8StringToHex('hello'))).toEqual('hello');
    });

    test('hexToField should correctly convert hex into a finite field element, in decimal representation', () => {
      expect(hexToField('0x1e', 40)).toEqual('30'); // 30(dec) = 0x1e mod 40 = 20
      expect(hexToField('0x1e', 25)).toEqual('5'); // 30(dec) = 0x1e mod 25 = 5
    });

    test('hexToBinArray should correctly convert a hex string into a bit string array', () => {
      expect(hexToBinArray('0xa1')).toEqual(['1', '0', '1', '0', '0', '0', '0', '1']);
    });

    test('hexToBin should correctly convert a hex string into a bit string', () => {
      expect(hexToBin('0xa1')).toEqual('10100001');
    });

    test('hexToByte should correctly convert hex into an array of decimal byte strings', () => {
      expect(hexToBytes('0xa1')).toEqual(['0']);
    });

    test('hexToDec should correctly convert hex into a decimal', () => {
      expect(hexToDec(hex)).toEqual(dec);
    });

    test(`hexToFieldLimbs should correctly convert hex into a 'blocks' of finite field elements, of specified bit size, in decimal representation`, () => {
      expect(hexToFieldLimbs('0x1e', 2)).toEqual(['1', '3', '2']); // 0x1e = 30 = 11110 = [01, 11, 10] = [1,3,2]
      expect(hexToFieldLimbs('0x1e', 2, 7)).toEqual(['0', '0', '0', '0', '1', '3', '2']); // 0x1e = 30 = 11110 = [01, 11, 10] = [1,3,2] = [0,0,0,0,1,3,2]
      expect(hexToFieldLimbs('0x1e', 3, 7)).toEqual(['0', '0', '0', '0', '0', '3', '6']); // 0x1e = 30 = 11110 = [011, 110] = [3,6] = [0,0,0,0,0,3,6]
      expect(hexToFieldLimbs('0x1e', 4, 2)).toEqual(['1', '14']); // 0x1e = 30 = 11110 = [01, 1110] = [1,14]
      expect(hexToFieldLimbs('0x1e', 4, 1, true)).toEqual(['14']); // 0x1e = 30 = 11110 = [01, 1110] = [1,14] is longer than 1 limb; but we've specified that we want to silence warnings, to the second limb is chopped off silently.
      expect(() => {
        hexToFieldLimbs('0x1e', 4, 1);
      }).toThrow(); // 0x1e = 30 = 11110 = [01, 1110] = [1,14] is longer than 1 limb; so should throw, because silenceWarnings is not specified
    });

    test('isHex should correctly decide if a number is hex or not', () => {
      expect(isHex('0x02a7ce1bffb62c13bff46da151f1639b764602d56c8d4839d6cf2e57825c86bd')).toBe(
        true,
      );
      expect(isHex('02a7ce1bffb62c13bff46da151f1639b764602d56c8d4839d6cf2e57825c86bd')).toBe(true);
      expect(!isHex('0x2a7ce1bffb62c13bff46da151oopsf1639b764602d56c8d4839d6cf2e57825c86bd')).toBe(
        true,
      );
      expect(isHex('1234567890')).toBe(true);
    });

    test('requireHex should fail if a number is not hex', () => {
      expect(() => {
        requireHex('0xk2a7ce1bffb62c13bff46da151f1639b764602d56c8d4839d6cf2e57825c86bd');
      }).toThrow();
      expect(() => {
        requireHex('0x02a7ce1bffb62c13bff46da151f1639b764602d56c8d4839d6cf2e57825c86bd');
      }).not.toThrow();
    });

    test('strip0x should stip 0x', () => {
      expect(strip0x('0x1e')).toBe('1e');
    });

    test('ensure0x should append 0x to hex string', () => {
      expect(ensure0x('1e')).toBe('0x1e');
    });
  });

  describe('Functions on Binary Values', () => {
    test('binToDec should correctly convert a binary number to decimal', () => {
      expect(binToDec(bin)).toEqual(dec);
    });
    test('binToHex should correctly convert a binary number to hex', () => {
      expect(binToHex(bin)).toEqual(hex);
    });
  });

  describe('Functions on Decimal Values', () => {
    test('decToHex should correctly convert a decimal number to hex', () => {
      expect(decToHex(dec)).toEqual(hex);
    });
  });

  describe('Utility Functions', () => {
    test('hexToBinLimbs should split a decimal string into chunks of size N bits (N=8 in this test)', () => {
      expect(hexToBinLimbs(hex, 8)).toEqual([
        '11110001',
        '10011000',
        '11100011',
        '01000000',
        '00111011',
        '11011101',
        '10100011',
        '10100000',
      ]);
    });

    test('binToLimbs should split a bit string into chunks of size N bits (N=8 in this test), and pad the left-most chunk with zeros', () => {
      expect(binToLimbs(bin, 8)).toEqual([
        '11110001',
        '10011000',
        '11100011',
        '01000000',
        '00111011',
        '11011101',
        '10100011',
        '10100000',
      ]);
    });

    test('randomHex should produce a random hex string', async () => {
      const rnd = await randomHex(32);
      expect(2 + 64).toEqual(rnd.length);
    });

    test('parseToDigitsArray should parse hex to decimal integer array', () => {
      expect(parseToDigitsArray('f', 16)).toEqual([15]);
    });

    test('convertBase should hex to decimal integer', () => {
      expect(convertBase('f', 16, 10)).toEqual('15');
    });
  });

  describe('shaHash functions', () => {
    test('shaHash() should correctly hash a number', () => {
      const testHash = shaHash('0x0000000000002710a48eb90d402c7d1fcd8d31e3cc9af568');
      const hash = '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      expect(testHash).toEqual(hash);
    });
  });

  describe('mimcHash functions', () => {
    test('mimcHash() should correctly hash a number', () => {
      const testHash = mimcHash(
        [BigInt('0x0000000000002710a48eb90d402c7d1fcd8d31e3cc9af568')],
        'BLS12_377',
      );
      const hash = '6401499393066932417511074960982810456604635503793276426486794047153089421441';
      expect(testHash.toString()).toEqual(hash);
    });
  });
});
