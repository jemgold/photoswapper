'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*global $, window, location, CSInterface, SystemPath, themeManager, React, ReactDOM */

var _ReactRedux = ReactRedux;
var Provider = _ReactRedux.Provider;
var connect = _ReactRedux.connect;


var csInterface = new CSInterface();

function loadJSX(fileName) {
  var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
  csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
}

var SET_SYSTEM_FONT_LIST = 'SET_SYSTEM_FONT_LIST';
var SET_FONT_ARRAY = 'SET_FONT_ARRAY';
var SET_ACTIVE_LAYER = 'SET_ACTIVE_LAYER';

function setSystemFontList(list) {
  return {
    type: SET_SYSTEM_FONT_LIST,
    data: R.groupBy(R.prop('family'), R.take(100, list))
  };
}

function setFontArray(data) {
  return {
    type: SET_FONT_ARRAY,
    data: data
  };
}

var initialState = {
  systemFonts: [],
  fontArray: [],
  activeLayer: null
};

function reducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case SET_SYSTEM_FONT_LIST:
      {
        var systemFonts = action.data;
        return R.assoc('systemFonts', systemFonts, state);
      }
    case SET_ACTIVE_LAYER:
      {
        return R.assoc('activeLayer', action.data, state);
      }
    case SET_FONT_ARRAY:
      {
        return R.assoc('fontArray', action.data, state);
      }
  }

  return state;
}

var store = Redux.createStore(reducer);

var Button = function Button(props) {
  return React.createElement('button', {
    className: 'topcoat-button--large hostFontSize',
    onClick: props.onClick,
    children: props.children
  });
};

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(App).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.getFontList();
    }
  }, {
    key: 'getFontList',
    value: function getFontList() {
      csInterface.evalScript('getFontList()', function (systemFonts) {
        store.dispatch(setSystemFontList(JSON.parse(systemFonts)));
      });
    }
  }, {
    key: 'getActiveLayer',
    value: function getActiveLayer() {
      csInterface.evalScript('getActiveTextItem()', function (layer) {
        console.log('yo');
        store.dispatch({ type: SET_ACTIVE_LAYER, data: layer });
      });
    }
  }, {
    key: 'onChangeFonts',
    value: function onChangeFonts(e) {
      var fonts = R.compose(R.map(R.trim), R.split(','), R.path(['target', 'value']))(e);

      store.dispatch(setFontArray(fonts));
    }
  }, {
    key: 'updateLayerFont',
    value: function updateLayerFont() {
      // const { activeLayer } = this.props;
      // if (!activeLayer) { return; }

      var _props = this.props;
      var systemFonts = _props.systemFonts;
      var fontArray = _props.fontArray;

      var postScriptName = R.path([R.head(fontArray), 0, 'postScriptName'], systemFonts);
      console.log(postScriptName);
      csInterface.evalScript('updateLayerFont("' + postScriptName + '")');
    }
  }, {
    key: 'updateLayerFonts',
    value: function updateLayerFonts() {
      // const { activeLayer } = this.props;
      // if (!activeLayer) { return; }

      var _props2 = this.props;
      var systemFonts = _props2.systemFonts;
      var fontArray = _props2.fontArray;

      var postScriptNames = R.map(function (font) {
        return R.path([font, 0, 'postScriptName'], systemFonts);
      }, fontArray);
      postScriptNames.forEach(function (font, i) {
        csInterface.evalScript('duplicateLayer("' + font + '", "' + i + '")', function (bounds) {
          return console.log(bounds);
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return React.createElement(
        'div',
        null,
        React.createElement(
          Button,
          { onClick: this.getFontList },
          'Get Fonts!'
        ),
        React.createElement(
          'select',
          null,
          R.keys(this.props.systemFonts).map(function (family) {
            return React.createElement(
              'option',
              { key: family },
              family
            );
          })
        ),
        React.createElement('input', { type: 'text', onChange: function onChange(e) {
            return _this2.onChangeFonts(e);
          } }),
        React.createElement(
          Button,
          { onClick: this.getActiveLayer },
          'Get Active Layer'
        ),
        React.createElement(
          Button,
          { onClick: function onClick() {
              return _this2.updateLayerFonts();
            } },
          'Update Font'
        ),
        this.props.activeLayer,
        React.createElement(
          'ul',
          null,
          this.props.fontArray.map(function (font, i) {
            return React.createElement(
              'li',
              { key: i },
              font
            );
          })
        )
      );
    }
  }]);

  return App;
}(React.Component);

var mapStateToProps = function mapStateToProps(state) {
  var systemFonts = state.systemFonts;
  var activeLayer = state.activeLayer;
  var fontArray = state.fontArray;

  return {
    systemFonts: systemFonts, activeLayer: activeLayer, fontArray: fontArray
  };
};

var ConnectedApp = connect(mapStateToProps)(App);

function init() {
  loadJSX("json2.js");

  themeManager.init();
  function PhotoshopCallbackUnique(csEvent) {
    console.log(csEvent);
  }

  var extensionId = csInterface.getExtensionID();
  csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + extensionId, function (event) {
    console.log(event);
  });

  ReactDOM.render(React.createElement(
    Provider,
    { store: store },
    React.createElement(ConnectedApp, null)
  ), document.getElementById('react-root'));
}

init();
