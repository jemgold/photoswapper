/*global $, window, location, CSInterface, SystemPath, themeManager, React, ReactDOM */

const { Provider, connect } = ReactRedux;

const csInterface = new CSInterface();


function loadJSX (fileName) {
  const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
  csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
}


const SET_SYSTEM_FONT_LIST = 'SET_SYSTEM_FONT_LIST';
const SET_FONT_ARRAY = 'SET_FONT_ARRAY';
const SET_ACTIVE_LAYER = 'SET_ACTIVE_LAYER';

function setSystemFontList(list) {
  return {
    type: SET_SYSTEM_FONT_LIST,
    data: R.groupBy(R.prop('family'), R.take(100, list))
  }
}

function setFontArray(data) {
  return {
    type: SET_FONT_ARRAY,
    data
  }
}

const initialState = {
  systemFonts: [],
  fontArray: [],
  activeLayer: null,
}

function reducer (state = initialState, action) {
  switch (action.type) {
    case SET_SYSTEM_FONT_LIST: {
      const systemFonts = action.data;
      return R.assoc('systemFonts', systemFonts, state);
    }
    case SET_ACTIVE_LAYER: {
      return R.assoc('activeLayer', action.data, state);
    }
    case SET_FONT_ARRAY: {
      return R.assoc('fontArray', action.data, state);
    }
  }

  return state;
}

const store = Redux.createStore(reducer);

const Button = function(props) {
  return (
    <button
      className='topcoat-button--large hostFontSize'
      onClick={props.onClick}
      children={props.children}
    />
  )
}

class App extends React.Component {
  componentDidMount() {
    this.getFontList();
  }

  getFontList() {
    csInterface.evalScript('getFontList()', function(systemFonts) {
      store.dispatch(setSystemFontList(JSON.parse(systemFonts)));
    });
  }

  getActiveLayer() {
    csInterface.evalScript('getActiveTextItem()', function(layer) {
      console.log('yo');
      store.dispatch({ type: SET_ACTIVE_LAYER, data: layer })
    });
  }

  onChangeFonts(e) {
    const fonts = R.compose(
      R.map(R.trim),
      R.split(','),
      R.path(['target', 'value'])
    )(e)

    store.dispatch(setFontArray(fonts))
  }

  updateLayerFont() {
    // const { activeLayer } = this.props;
    // if (!activeLayer) { return; }

    const { systemFonts, fontArray } = this.props;
    const postScriptName = R.path([
      R.head(fontArray),
      0,
      'postScriptName'
    ], systemFonts);
    console.log(postScriptName);
    csInterface.evalScript(`updateLayerFont("${postScriptName}")`);
  }

  updateLayerFonts() {
    // const { activeLayer } = this.props;
    // if (!activeLayer) { return; }

    const { systemFonts, fontArray } = this.props;
    const postScriptNames = R.map((font) => R.path([
      font,
      0,
      'postScriptName'
    ], systemFonts), fontArray)
    postScriptNames.forEach((font, i) => {
      csInterface.evalScript(`duplicateLayer("${font}", "${i + i}")`, (bounds) => console.log(bounds));
    })
  }

  render() {

    return (
      <div>
        <Button onClick={this.getFontList}>Get Fonts!</Button>
        <select>
          { R.keys(this.props.systemFonts).map((family) => <option key={family}>{family}</option>) }
        </select>
        <input type="text" onChange={(e) => this.onChangeFonts(e)} />
        <Button onClick={this.getActiveLayer}>Get Active Layer</Button>
        <Button onClick={() => this.updateLayerFonts()}>Update Font</Button>
        { this.props.activeLayer }

        <ul>
        { this.props.fontArray.map((font, i) => <li key={i}>{font}</li>) }
      </ul>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { systemFonts, activeLayer, fontArray } = state;
  return {
    systemFonts, activeLayer, fontArray
  }
}

const ConnectedApp = connect(
  mapStateToProps
)(App);

function init() {
  loadJSX("json2.js");

  themeManager.init();
  function PhotoshopCallbackUnique(csEvent) {
    console.log(csEvent);
  }

  var extensionId =  csInterface.getExtensionID();
  csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + extensionId, function(event) {
    console.log(event)
  });


  ReactDOM.render(<Provider store={store}>
      <ConnectedApp />
    </Provider>,
    document.getElementById('react-root')
  )
}

init();
