// /* eslint-disable no-restricted-globals */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-param-reassign */
// (function init(binding) {
//   let currentPage;
//
//   const PASSED = 'passed';
//   const FAILED = 'failed';
//   const HIDDEN = 'hidden';
//   const ACTIVE = 'active';
//   const TEST_DATA = 'test-data';
//   const HISTORY = 'history';
//   const PASSED_BUTTON_ID = 'passed-button';
//   const FAILED_BUTTON_ID = 'failed-button';
//   const MESSAGE = 'message';
//   const IMAGE = 'image';
//   const STACK = 'stack';
//   const SHOWING_FAILED = 'showingFailed';
//   const SHOWING_PASSED = 'showingPassed';
//   const showing = {
//     [SHOWING_PASSED]: true,
//     [SHOWING_FAILED]: true,
//   };
//
//   const getElementsByClasses = (...cssClasses) => {
//     const listOfElements = document.body.querySelectorAll(
//       cssClasses
//         .map(cssClass => `.${cssClass}`)
//         .join(''),
//     );
//     return listOfElements ? [...listOfElements] : [];
//   };
//
//   const getElementById = id => document.getElementById(id);
//
//   const addClassToElement = (cssClass, element) => {
//     if (element) {
//       element.className = `${element.className} ${cssClass}`;
//     }
//   };
//
//   const removeClassFromElement = (cssClass, element) => {
//     if (element) {
//       element.className = element.className.replace(new RegExp(cssClass, 'g'), '');
//     }
//   };
//
//   const hideElement = element => addClassToElement(HIDDEN, element);
//   const showElement = element => removeClassFromElement(HIDDEN, element);
//   const activateElement = element => addClassToElement(ACTIVE, element);
//   const deactivateElement = element => removeClassFromElement(ACTIVE, element);
//
//   const getFailedButton = () => getElementById(FAILED_BUTTON_ID);
//   const getPassedButton = () => getElementById(PASSED_BUTTON_ID);
//
//   const activateFailedButton = () => activateElement(getFailedButton());
//   const deactivateFailedButton = () => deactivateElement(getFailedButton());
//
//   const activatePassedButton = () => activateElement(getPassedButton());
//   const deactivatePassedButton = () => deactivateElement(getPassedButton());
//
//   const showByClassOnCurrentPage = cssClass => getElementsByClasses(cssClass, currentPage)
//     .forEach(showElement);
//
//   const hideByClassOnCurrentPage = cssClass => getElementsByClasses(cssClass, currentPage)
//     .forEach(hideElement);
//
//   const showById = id => showElement(getElementById(id));
//   const hideByid = id => hideElement(getElementById(id));
//   const hideTestSuite = () => hideByid(TEST_DATA);
//   const showTestSuit = () => showById(TEST_DATA);
//   const hideHistory = () => hideByid(HISTORY);
//   const showHistory = () => showById(HISTORY);
//
//   const hideAllTestsOnCurrentPage = () => [PASSED, FAILED]
//     .forEach(testType => hideByClassOnCurrentPage(testType));
//
//   const toggle = (state) => {
//     const result = !showing[state];
//     showing[state] = result;
//     return result;
//   };
//
//   const toggleFailedTests = () => {
//     if (toggle(SHOWING_FAILED)) {
//       showByClassOnCurrentPage(FAILED);
//       activateFailedButton();
//     } else {
//       hideByClassOnCurrentPage(FAILED);
//       deactivateFailedButton();
//     }
//     return false;
//   };
//
//   const togglePassedTests = () => {
//     if (toggle(SHOWING_PASSED)) {
//       showByClassOnCurrentPage(PASSED);
//       activatePassedButton();
//     } else {
//       hideByClassOnCurrentPage(PASSED);
//       deactivatePassedButton();
//     }
//     return false;
//   };
//
//   const moveToElementById = (id) => {
//     const pixelsToMoveUp = 80;
//     const pixelsToMoveRight = 0;
//     location.href = `#${id}`;
//     window.scrollBy(
//       pixelsToMoveRight,
//       -pixelsToMoveUp,
//     );
//   };
//
//   const switchToPage = (testRunId, testSuiteId) => {
//     [hideAllTestsOnCurrentPage, hideHistory, showTestSuit]
//       .forEach(method => method());
//
//     currentPage = testRunId;
//     [
//       [showing[SHOWING_FAILED], FAILED],
//       [showing[SHOWING_PASSED], PASSED],
//     ].forEach(([active, cssClass]) => active
//       && showByClassOnCurrentPage(cssClass));
//
//     moveToElementById(testSuiteId);
//
//     return false;
//   };
//
//   const getChildOfElement = (id, childClass) => {
//     const element = getElementById(id);
//     return element
//       ? element.getElementsByClassName(childClass)[0]
//       : {};
//   };
//   const activeteChildAndButton = (id, childClass) => [childClass, `${childClass}-button`]
//     .forEach(cssClass => activateElement(getChildOfElement(id, cssClass)));
//
//   const deactiveteChildAndButton = (id, childClass) => [childClass, `${childClass}-button`]
//     .forEach(cssClass => deactivateElement(getChildOfElement(id, cssClass)));
//
//   const showStack = id => activeteChildAndButton(id, STACK);
//   const showImage = id => activeteChildAndButton(id, IMAGE);
//   const showMessage = id => activeteChildAndButton(id, MESSAGE);
//
//   const hideStack = id => deactiveteChildAndButton(id, STACK);
//   const hideImage = id => deactiveteChildAndButton(id, IMAGE);
//   const hideMessage = id => deactiveteChildAndButton(id, MESSAGE);
//
//   const toggleStack = (id) => {
//     if (toggle(`${STACK}-${id}`)) {
//       showStack(id);
//     } else {
//       hideStack(id);
//     }
//     return false;
//   };
//
//   const toggleImage = (id) => {
//     if (toggle(`${IMAGE}-${id}`)) {
//       showImage(id);
//     } else {
//       hideImage(id);
//     }
//     return false;
//   };
//
//   const toggleMessage = (id) => {
//     if (toggle(`${MESSAGE}-${id}`)) {
//       showMessage(id);
//     } else {
//       hideMessage(id);
//     }
//     return false;
//   };
//
//   const moveToHistory = () => {
//     [hideTestSuite, showHistory]
//       .forEach(method => method());
//     return false;
//   };
//
//   const publicMethods = {
//     toggleMessage,
//     toggleImage,
//     toggleStack,
//     toggleFailedTests,
//     togglePassedTests,
//     switchToPage,
//     moveToHistory,
//   };
//
//   Object.keys(publicMethods)
//     .forEach((methodName) => {
//       binding[methodName] = publicMethods[methodName];
//     });
// }(window));
