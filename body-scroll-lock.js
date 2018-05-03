"use strict";
var bodyScrollLock = {
  _slicedToArray: (function() {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;
      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
    return function(arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  })(),

  // Adopted and modified solution from Bohdan Didukh (2017)
  // https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi

  isIosDevice: typeof window !== "undefined" && window.navigator && window.navigator.platform && /iPad|iPhone|iPod|(iPad Simulator)|(iPhone Simulator)|(iPod Simulator)/.test(window.navigator.platform),

  firstTargetElement: null,
  allTargetElements: {},
  initialClientY: -1,
  previousBodyOverflowSetting: "",
  previousDocumentElementOverflowSetting: "",

  preventDefault: function(rawEvent) {
    var e = rawEvent || window.event;
    if (e.preventDefault) e.preventDefault();

    return false;
  },

  setOverflowHidden: function() {
    // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
    // the responsiveness for some reason. Setting within a setTimeout fixes this.
    setTimeout(function() {
      this.previousBodyOverflowSetting = document.body.style.overflow;
      this.previousDocumentElementOverflowSetting = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    });
  },

  restoreOverflowSetting: function() {
    // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
    // the responsiveness for some reason. Setting within a setTimeout fixes this.
    setTimeout(function() {
      document.body.style.overflow = this.previousBodyOverflowSetting;
      document.documentElement.style.overflow = this.previousDocumentElementOverflowSetting;
    });
  },

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
  isTargetElementTotallyScrolled: function(targetElement) {
    return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
  },

  handleScroll: function(event, targetElement) {
    var clientY = event.targetTouches[0].clientY - this.initialClientY;

    if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
      // element is at the top of its scroll
      return this.preventDefault(event);
    }

    if (this.isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
      // element is at the top of its scroll
      return this.preventDefault(event);
    }

    return true;
  },

  disableBodyScroll: function(targetElement) {
    if (this.isIosDevice) {
      if (targetElement) {
        this.allTargetElements[targetElement] = targetElement;

        targetElement.ontouchstart = function(event) {
          if (event.targetTouches.length === 1) {
            // detect single touch
            this.initialClientY = event.targetTouches[0].clientY;
          }
        };
        targetElement.ontouchmove = function(event) {
          if (event.targetTouches.length === 1) {
            // detect single touch
            scrollJack.handleScroll(event, targetElement);
          }
        };
      }
    } else {
      this.setOverflowHidden();
    }

    if (!this.firstTargetElement) this.firstTargetElement = targetElement;
  },

  clearAllBodyScrollLocks: function() {
    if (this.isIosDevice) {
      // Clear all this.allTargetElements ontouchstart/ontouchmove handlers, and the references
      Object.entries(this.allTargetElements).forEach(function(_ref) {
        var _ref2 = this._slicedToArray(_ref, 2),
          key = _ref2[0],
          targetElement = _ref2[1];

        targetElement.ontouchstart = null;
        targetElement.ontouchmove = null;

        delete this.allTargetElements[key];
      }, this);

      // Reset initial clientY
      this.initialClientY = -1;
    } else {
      this.restoreOverflowSetting();

      this.firstTargetElement = null;
    }
  },

  enableBodyScroll: function(targetElement) {
    if (this.isIosDevice) {
      targetElement.ontouchstart = null;
      targetElement.ontouchmove = null;
    } else if (this.firstTargetElement === targetElement) {
      this.restoreOverflowSetting();

      this.firstTargetElement = null;
    }
  }
};
