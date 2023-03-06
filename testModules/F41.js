"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _AbstractTest = _interopRequireDefault(require("../src/AbstractTest"));

class TestF41 extends _AbstractTest.default {
  constructor() {
    super();
    this.id = ['1.1.1::F41'];
    this.guidelines = ['1.1.1'];
    this.type = "error";
    this.tagName = "META";
    this.message = "meta redirect with a time limit";
    this.level = "A";
    this.selector = true;
    this.fid = "F40";
  }

  evaluate(node, options) {
    return document.querySelector('meta[http-equiv="refresh"][content*="url"]') ? document.querySelectorAll('meta[http-equiv="refresh"][content*="url"]') : false;
  }

}

var _default = new TestF41();

exports.default = _default;
//# sourceMappingURL=F41.js.map