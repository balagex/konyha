export function napRovidites(datum: Date, locale: Intl.LocalesArgument): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        // year: 'numeric',
        // month: 'long',
        // day: 'numeric',
    };
    return datum.toLocaleDateString(locale ? locale : undefined, options)
}

export function YYYYMMDDToDate(datum: string, ora?: number, perc?: number): Date {
    if (datum) {
        return new Date(parseInt(datum.substring(0, 4)), parseInt(datum.substring(4, 6)) - 1, parseInt(datum.substring(6, 8)), (ora ? ora : 0), (perc ? perc : 0));
    } else {
        return new Date();
    }
}

export function dateToYYYYMMDD(datum: Date): string {
    if (datum && datum instanceof Date) {
        return datum.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replaceAll('.', '').replaceAll(' ', '');
    } else {
        return null;
    }
}

export function dateToYYYYMMDDhhmmss(datum: Date, jelekkel: boolean): string {
    if (datum && datum instanceof Date) {
        let result = datum.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        if (jelekkel) {
            return result.replace(' ', '').replace(' ', '');
        } else {
            return result.replaceAll('.', '').replaceAll(' ', '').replaceAll(':', '');
        }
    } else {
        return null;
    }
}

export function intervallDates(start: Date, end: Date): Date[] {
    if (start && start instanceof Date && end && end instanceof Date && start <= end) {
        const result: Date[] = [];
        let datum = start;
        do {
            result.push(datum);
            let ujDatum = new Date(datum);
            ujDatum.setDate(ujDatum.getDate() + 1);
            datum = ujDatum;
        } while (datum <= end);
        return result;
    } else {
        return [start];
    }
}

export function doCompare(a: any, b: any, direction: number, useLocalCompare: boolean): number {
    if (useLocalCompare) {
        const aStr: string = '' + a;
        const bStr: string = '' + b;
        if (a && b) {
            const minLenght = aStr.length < bStr.length ? aStr.length : bStr.length;
            let i: number = 0;
            while (i < minLenght) {
                const res = aStr.charAt(i).localeCompare(bStr.charAt(i));
                if (res !== 0) {
                    return res * direction;
                } else {
                    i++;
                }
            }
            if (minLenght === aStr.length) {
                if (minLenght === bStr.length) {
                    return 0;
                } else {
                    return -1 * direction;
                }
            } else {
                return 1 * direction;
            }
        } else {
            return 0;
        }
        //             return a.localeCompare(b) * direction;
    } else {
        if (a < b) {
            return -1 * direction;
        } else if (a > b) {
            return 1 * direction;
        } else {
            return 0;
        }
    }
}

export function sortFunction(a: any, b: any, direction: number, property: string, property2: string, useLocalCompareArg?: boolean): number {
    const useLocalCompare = useLocalCompareArg ? useLocalCompareArg : false;
    if (!property) {
        const res3 = doCompare(a, b, direction, useLocalCompare);
        return res3;
    } else {
        const res1 = doCompare(a[property], b[property], direction, useLocalCompare);
        if (res1 === 0 && property2 != null) {
            const res2 = doCompare(a[property2], b[property2], direction, useLocalCompare);
            return res2;
        } else {
            return res1;
        }
    }
}

// https://www.adobe.com/express/feature/image/resize
export function resizeImage(imageURL: any): Promise<any> {
    return new Promise((resolve) => {
        const image = new Image();

        image.onload = function () {
            console.debug('image ', imageURL, image, image.width, image.height);
            const canvas = document.createElement('canvas');

            let szelesseg = null;
            let magassag = null;


            if (image.width > image.height) {
                szelesseg = 1000;
                magassag = 1000 * (image.height / image.width);
            } else {
                magassag = 1000;
                szelesseg = 1000 * (image.width / image.height)

            }

            canvas.width = szelesseg;
            canvas.height = magassag;
            const ctx = canvas.getContext('2d');
            if (ctx != null) {
                ctx.drawImage(image, 0, 0, szelesseg, magassag);
            }
            var data = canvas.toDataURL('image/jpeg', 1);
            resolve(data);
        };
        image.src = imageURL;
    });
}
