import { expect } from 'chai';
import { capitalizeFirstLetter } from '../../../src/utilities/strings';
import { typeChecks } from '../../../src/utilities/typeChecks';

describe('typeChecks', (): void => {
  const typeExamples: any = {
    array: [],
    number: 1,
    string: '',
    function: (): any => ({}),
    date: new Date(),
    regExp: new RegExp('', ''),
  };
  const types = Object.keys(typeExamples);

  types.forEach((type: string): void => {
    const nameOfTypeCheck = `is${capitalizeFirstLetter(type)}`;
    describe(nameOfTypeCheck, (): void => {
      const currentType = typeExamples[type];
      const otherTypes = types.filter(((eachType: string): boolean => eachType !== type));
      const typeCheck = typeChecks[nameOfTypeCheck];
      it(
        `Will return true if passed an "${type}" type`,
        (): any => expect(typeCheck(currentType)).to.equal(true),
      );
      otherTypes.forEach((otherType: string): any => it(
        `Will return false if passed an "${otherType}" type`,
        (): any => expect(typeCheck(typeExamples[otherType])).to.equal(false),
      ));
    });
  });
});
