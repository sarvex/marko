import { t as _t } from "marko/dist/runtime/html";

const _marko_template = _t();

export default _marko_template;
import _customTag from "./components/custom-tag/index.marko";
import _marko_tag from "marko/dist/runtime/helpers/render-tag";
import _marko_renderer from "marko/dist/runtime/components/renderer";
const _marko_componentType = "MoYb8VAR",
      _marko_component = {};
_marko_template._ = _marko_renderer(function (input, out, _component, component, state) {
  _marko_tag(_customTag, {
    "dataAttrA": true,
    "data-attr-b": true,
    "dataAttrC": true,
    "data-attr-d": true,
    "dataAttrE": true,
    "preserve-attr-a": true,
    "notPreserveAttrA": true
  }, out, _component, "0");
}, {
  t: _marko_componentType,
  i: true
}, _marko_component);