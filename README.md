<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [zkp-utils](#zkp-utils)
  - [Install](#install)
  - [Functions](#functions)
  - [Developer](#developer)
    - [Test](#test)
    - [Test with yalc](#test-with-yalc)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# zkp-utils

This library contains many utility functions for use in zkp applications.

## Install

In your NodeJS project:  
`npm i -s zkp-utils`

## Functions

- number-conversions
  - hex
    ```js
    strip0x,
    ensure0x,
    isHex,
    requireHex,
    leftPadHex,
    truncateHex,
    resizeHex,
    hexToUtf8String,
    hexToAscii,
    hexToBinArray,
    hexToBin,
    hexToBytes,
    hexToDec,
    hexToField,
    hexToLimbs,
    hexToDecLimbs,
    hexToBinLimbs,
    randomHex,
    ```
  - decimal
    ```js
    decToHex,
    decToBin,
    decToBinLimbs,
    ```
  - binary
    ```js
    binToHex,
    binToDec,
    binToLimbs,
    ```
  - char
    ```js
    utf8StringToHex,
    asciiToHex,
    ```
- hashes
  - sha256
    ```js
    shaHash;
    ```
  - mimc
    ```js
    mimcHash;
    ```

## Developer

### Test

Clone the repo. `npm i`  
`npm test`

### Test with yalc

If you've made local changes to this repo, and would like to test whether those (unpublished)
changes will work with some dependent zkp appliation (zApp)...

...then you’ll need to install your local, ‘branched’ version of `zkp-utils` in your zApp.

```sh
cd path/to/zkp-utils/
yalc publish
```

You should see something like "`@eyblockchain/zkp-utils@0.0.0-3df45b8c published in store.`". Notice
the ‘signature’ `3df45b8c` .

```sh
cd path/to/your/zApp/
```

Remove the package-lock.json and the node_modules from your zApp's root (if they exist on your
machine).

Then:

```sh
yalc add @eyblockchain/zkp-utils
```

You’ll see that this has ‘swapped-in’ the ‘published’ (yalc version) of `zkp-utils` in the
`package.json`. It’s also created `.yalc.lock` (which shows that you’ve replaced the ‘proper’ npm
package of `zkp-utils` with your ‘yalc version’ (see the `signature` field in this file, which
should match the signature from earlier)).

Now install node modules:

```sh
npm i
```

If your zApp runs in a container, then you might need to also edit its dockerfile:

Change a line in `<your zApp>/Dockerfile` from `RUN npm ci` to `RUN npm install`.

Add a line in `<your zApp>/docker-compose.yml`:

```yaml
yourService:
  build:
    context: .
    dockerfile: Dockerfile
volumes:
  - ./.yalc:/app/.yalc # <<< ADD THIS LINE (or something similar)!!!
```

When you're happy that your local changes to `zkp-utils` work and you wish to create a PR, you MUST
remove any references to `yalc`, or the PR shouldn't be accepted.
