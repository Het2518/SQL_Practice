import '@testing-library/jest-dom';

// Mock scrollIntoView which is missing in jsdom
window.HTMLElement.prototype.scrollIntoView = function () {};
