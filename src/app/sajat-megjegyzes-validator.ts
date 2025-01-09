import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Recept } from './model/recept.type';
import { ReceptMegjegyzes } from './model/recept-megjegyzes.type';

export function sajatMegjegyzesValidator(recept: Recept): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

        if (recept && recept.megjegyzesek?.length > 0) {

            let sajatMegjegyzes: ReceptMegjegyzes = null;
            if (recept.megjegyzesek.findIndex(m => m.sajatE) > -1) {
                sajatMegjegyzes = recept.megjegyzesek.find(m => m.sajatE);
            }

            if (sajatMegjegyzes && !sajatMegjegyzes.duma) {
                return { required: true };
            }
        }

        return null;
    };
}