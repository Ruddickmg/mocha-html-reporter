import { expect } from 'chai';
import { getStyles } from '../../../src/report/styles';

describe('styles', (): void => {
  const mainTestStyles = '.test{background:#000}';
  it('Will return css from sass files in a specified directory', async (): Promise<void> => {
    expect(await getStyles(`${process.cwd()}/test/helpers/mainTest.scss`))
      .to.equal(mainTestStyles);
  });
});
