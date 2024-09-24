export enum BoltAzon {
    LIDL = 'LIDL',
    ALDI = 'ALDI',
    TESCO = 'TESCO',
    SPAR = 'SPAR',
    PENNY = 'PENNY',
    AUCHAN = 'AUCHAN',
    EGYEB = 'EGYEB'
}

export function getBoltAzonViaString(stringValue: string): BoltAzon {

    if (stringValue === BoltAzon.LIDL) {
        return BoltAzon.LIDL;
    } else if (stringValue === BoltAzon.ALDI) {
        return BoltAzon.ALDI;
    } else if (stringValue === BoltAzon.TESCO) {
        return BoltAzon.TESCO;
    } else if (stringValue === BoltAzon.SPAR) {
        return BoltAzon.SPAR;
    } else if (stringValue === BoltAzon.PENNY) {
        return BoltAzon.PENNY;
    } else if (stringValue === BoltAzon.AUCHAN) {
        return BoltAzon.AUCHAN;
    } else {
        return BoltAzon.EGYEB
    }
}