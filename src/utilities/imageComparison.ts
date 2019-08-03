import { createWriteStream, readFile } from 'fs';
import { PATH_SEPARATOR } from '../constants/constants';
import { capitalizeFirstLetter } from './strings';

const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

export interface Coordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageComparisons {
  screenShot: string;
  baseline: string;
  difference: string;
  [type: string]: string;
}

const screenShotComparison = (() => {
  let outputDirectory: string;

  const NO_FILE_EXISTS = 'ENOENT';
  const BASE_64_ENCODING = 'base64';
  const outputFile = (name: string): string => `${outputDirectory}${PATH_SEPARATOR}${name}.png`;
  const convertBase64ToPng = (
    image: string,
  ): any => PNG.sync.read(Buffer.from(image, BASE_64_ENCODING));
  const convertPngToBase64 = (png: any): string => PNG.sync.write(png).toString(BASE_64_ENCODING);
  const setScreenShotDirectory = (directory: string): void => {
    outputDirectory = directory;
  };

  const writeFileToOutputDirectory = (
    name: string,
    data: any,
  ): Promise<void> => new Promise((resolve, reject) => {
    const path = outputFile(name);
    const stream = createWriteStream(path);
    stream.write(data);
    stream.end();
    stream.on('finish', () => {
      resolve();
    });
    stream.on('error', reject);
  });

  const extractImageFromScreenShot = (
    pngImage: any,
    {
      x,
      y,
      width,
      height,
    }: Coordinates,
  ) => {
    const { width: pngWidth, height: pngHeight } = pngImage;
    const resultImage = new PNG({ width, height });
    [{ png: pngHeight, comp: height, name: 'height' }, { png: pngWidth, comp: width, name: 'width' }]
      .forEach(({ png, comp, name }) => {
        if (png < comp) {
          throw new Error(`${capitalizeFirstLetter(name)} of the element to be compared is greater than the image it is being taken from, please be sure the image compared element is visible on the page`);
        }
      });

    PNG.bitblt(
      pngImage,
      resultImage,
      x,
      y,
      resultImage.width,
      resultImage.height,
      0,
      0,
    );
    return resultImage;
  };

  const compareToPreviousImage = (
    baseline: any,
    screenShot: any,
  ) => {
    const threshold = 0.1;
    const { width, height } = baseline;
    const difference = new PNG({ width, height });
    const amountOfMismatchedPixels = pixelmatch(
      baseline.data,
      screenShot.data,
      difference.data,
      width,
      height,
      { threshold },
    );
    const images: ImageComparisons = {
      difference,
      baseline,
      screenShot,
    };
    const differenceExists = amountOfMismatchedPixels > 0;
    const comparisonImages = Object.keys(images)
      .reduce((comparisons: ImageComparisons, image: string) => ({
        ...comparisons,
        [image]: convertPngToBase64(images[image]),
      }), {});

    return differenceExists && comparisonImages;
  };

  const saveToDirectory = (content: any, name: string): Promise<void> => (
    outputDirectory
      ? writeFileToOutputDirectory(name, PNG.sync.write(content))
      : Promise.reject(new Error('Unable to save image, no output directory was specified.'))
  );

  const getExistingImage = (name: string): Promise<any> => new Promise((
    resolve,
    reject,
  ) => readFile(
    outputFile(name),
    (error: Error, buffer: any): void => ((error || !buffer) ? reject(error) : resolve(buffer)),
  ));

  const compareScreenShotWithBaseline = (
    pngImage: any,
    name: string,
  ): Promise<ImageComparisons> => getExistingImage(name)
    .then(comparison => compareToPreviousImage(pngImage, PNG.sync.read(comparison)))
    .catch(error => {
      if (error.code === NO_FILE_EXISTS) {
        return saveToDirectory(pngImage, name);
      }
      throw error;
    })
    .then((result?: ImageComparisons) => (
      result || { image: convertPngToBase64(pngImage) }
    ) as ImageComparisons);

  const compareImageToBaseline = (
    image: string,
    name: string,
    coordinates: Coordinates,
  ) => {
    const pngImage = convertBase64ToPng(image);
    const comparison = coordinates
      ? extractImageFromScreenShot(pngImage, coordinates)
      : pngImage;
    return compareScreenShotWithBaseline(
      comparison,
      name,
    );
  };

  return {
    setScreenShotDirectory,
    compareImageToBaseline,
  };
})();

export const {
  setScreenShotDirectory,
  compareImageToBaseline,
} = screenShotComparison;
