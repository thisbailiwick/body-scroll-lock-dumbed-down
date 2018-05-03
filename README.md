Just a simplified version of [body-scroll-lock](https://github.com/willmcpo/body-scroll-lock). Meaning you can use it without the need for Babel, Webpack, Gulp, etc.
Include script on your page and:
```
// enable scroll lock but allow the targetElement to still scroll
bodyScrollLock.disableBodyScroll(targetElement);

// enable regular scroll interaction for element
bodyScrollLock.enableBodyScroll(targetElement);

// enable regular scroll interaction for all previously targeted elements
bodyScrollLock.clearAllBodyScrollLocks();
```