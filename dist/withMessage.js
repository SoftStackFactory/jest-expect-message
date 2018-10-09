'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

class JestAssertionError extends Error {
  constructor(result, callsite) {
    super(result.message());
    this.matcherResult = result;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, callsite);
    }
  }
}

const wrapMatcher = (matcher, customMessage) => {
  const newMatcher = (...args) => {
    try {
      return matcher(...args);
    } catch (error) {
      if (typeof customMessage !== 'string' || customMessage.length < 1 || !error.matcherResult) {
        throw error;
      }

      const { matcherResult } = error;
      const message = () => 'Custom message:\n  ' + customMessage ;

      throw new JestAssertionError(_extends({}, matcherResult, { message }), newMatcher);
    }
  };
  return newMatcher;
};

const wrapMatchers = (matchers, customMessage) => {
  return Object.keys(matchers).reduce((acc, name) => {
    const matcher = matchers[name];

    if (typeof matcher === 'function') {
      return _extends({}, acc, {
        [name]: wrapMatcher(matcher, customMessage)
      });
    }

    return _extends({}, acc, {
      [name]: wrapMatchers(matcher, customMessage) // recurse on .not/.resolves/.rejects
    });
  }, {});
};

exports.default = expect => {
  const expectProxy = (actual, customMessage) => wrapMatchers(expect(actual), customMessage); // partially apply expect to get all matchers and wrap them
  return Object.assign(expectProxy, expect); // clone additional properties on expect
};