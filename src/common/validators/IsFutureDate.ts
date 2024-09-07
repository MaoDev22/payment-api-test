import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export default function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [year, month] = value.split('-').map(Number);
          if (!year || !month) return false;

          const today = new Date();
          const expiryDate = new Date(parseInt("20"+year), month - 1);

          return expiryDate > today;
        },
        defaultMessage(args: ValidationArguments) {
          return 'The date should be in the future';
        }
      }
    });
  };
}
