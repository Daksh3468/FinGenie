import '@testing-library/jest-dom'

window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.Element.prototype.scrollIntoView = vi.fn()
