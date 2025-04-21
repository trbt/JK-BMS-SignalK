
const parseParam = function (paramDef, data) {
    // Convert the 8-byte data to 64-bit integer for shifts and masks or JS will lose bits
    let bigData = BigInt(data);
    bigData = bigData >> BigInt(paramDef.bitStart);
    bigData = bigData & BigInt(2 ** paramDef.bitLength - 1);
    // Now convert value back to JS number, apply multiplier and offset
    data = Number(bigData) * paramDef.resolution + paramDef.offset;
    return {
        path: paramDef.name,
        value: data,
    };
};

const JKCAN = {
    0x2F4: require("./0x2F4.json"),               /* BATT_ST */
    0x4F4: require("./0x4F4.json"),               /* CELL_VOLT */
    0x5f4: require("./0x5F4.json"),               /* CELL_TEMP */
    0x7F4: require("./0x7F4.json"),               /* ALM_INFO */
    0x18F128F4: require("./0x18F128F4.json"),     /* BATT_ST 2 */
    0x18F228F4: require("./0x18F228F4.json"),     /* ALL_TEMP           TODO: Enabled sensors mask */
    0x18F328F4: require("./0x18F328F4.json"),     /* BMSERR_INFO */
    0x18F428F4: require("./0x18F428F4.json"),     /* BMS_INFO */
    0x18F528F4: require("./0x18F528F4.json"),     /* BmsSwSta */
    0x18E028F4: require("./0x18E028F4.json")      /* CellVol */
    /*0x1806E5F4: require("./0x1806E5F4.json")*/  /* BMSChgINFO */
}

module.exports = {
    parseParam,
    JKCAN
}