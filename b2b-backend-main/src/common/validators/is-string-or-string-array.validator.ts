import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isStringOrStringArray', async: false })
export class IsStringOrStringArray implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value === 'string') {
      return true;
    }
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'captions must be a string or an array of strings';
  }
}