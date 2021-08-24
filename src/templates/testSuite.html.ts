import { TEST_SUITE_CONTENT, TEST_SUITE_TITLE } from '../scripts/constants';

export const testSuiteTemplate = `<li id="{{id}}" class="{{class}}">
    <h2 class=${TEST_SUITE_TITLE}>
        {{title}}
    </h2>
    <ul class=${TEST_SUITE_CONTENT}>
        {{content}}
    </ul>
</li>`;

export default testSuiteTemplate;
