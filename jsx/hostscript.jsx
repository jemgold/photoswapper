/*global $, Folder*/

function getDocName(){
  return app.documents.length ? app.activeDocument.name : "No docs open!";
}

function getActiveLayer() {
  return app.documents.length && app.activeDocument.activeLayer;
}

function getActiveTextItem() {
  var layer = getActiveLayer();
  if (layer && layer.textItem) {
    // layer.textItem.contents = "fucking this up!"
    return layer.name;
  } else {
    return null
  }
}

function duplicateLayer(postScriptName, i) {
  var layer = getActiveLayer();
  if (layer && layer.textItem) {
    var artboard = layer.parent;
    var newArtboard = artboard.duplicate();
    var bounds = newArtboard.bounds;

    newArtboard.translate(bounds[0], bounds[1]);
    //
    // var newTextLayer = artboard.children[0];
    // if (newArtboard.children[0].textItem) {
    //   new
    
    // if (layer.textItem.font === postScriptName) { return }
    // var newLayer = layer.duplicate(layer, ElementPlacement.PLACEBEFORE);
    // newLayer.translate(0, 600 * parseInt(i, 10));
    // newLayer.textItem.font = postScriptName;
  }
}

function updateLayerFonts(postScriptNames) {
  var layer = getActiveLayer();
  if (layer && layer.textItem) {
    for (var i = 0; i < postScriptNames.length; i++) {
      var newLayer = layer.duplicate(layer, ElementPlaceholder.PLACEBEFORE);
      newLayer.textItem.font = postScriptNames[i];
    }
  }
}

function updateLayerFont(postScriptName) {
  var layer = getActiveLayer();
  if (layer && layer.textItem) {
    layer.textItem.font = postScriptName;
  }
}

function updateLayerText(text) {
  var layer = getActiveLayer();
  if (layer && layer.textItem) {
    layer.textItem.contents = text;
  }
}

/*
interface Application {
  documents: ;
}

interface Document {
  activeLayer: Layer;
  artLayers: ArtLayer[];

}

interface TextFonts {
  length: number; // The number of elements in the collection
  parent: Application; // The containing application.
  typename: string; // the class name of the referenced TextFonts object
  getByName(name: string): TextFont; // Gets the first element in the TextFonts collection with the provided name
}

interface TextFont {
  family: string;
  name: string;
  parent: Application;
  postScriptName: string;
  style: string;
  typename: string; // The class name of the referenced TextFont
object
}

interface TextItem {
  // INCOMPLETE, adding bits as I use them
  contents: string; // RW
  font: string // RW, use TextFont.postScriptName
}
*/


function getFontList() {
  var f = [];
  for (var i = 0; i < app.fonts.length; i++) {
    var _font = app.fonts[i];
    var font = {
      family: _font.family,
      name: _font.name,
      postScriptName: _font.postScriptName
    };
    f.push(font);
  }
  return JSON.stringify(f);
}


///////////////////////////////////////////////////////////////////////////////
// Object: Logger
// Usage: Log information to a text file
// Input: String to full path of file to create or append, if no file is given
//        then output file Logger.log is created on the users desktop
// Return: Logger object
// Example:
//
//   var a = new Logger();
//   a.print( 'hello' );
//   a.print( 'hello2\n\n\nHi\n' ) ;
//   a.remove();
//   a.log( Date() );
//   a.print( Date() );
//   a.display();
//
///////////////////////////////////////////////////////////////////////////////
function Logger( inFile ) {

  // member properties

  // the file we are currently logging to
  if ( undefined == inFile ) {
    this.file = new File( Folder.desktop + "/PhotoshopEvents.log" );
  } else {
    this.file = new File( inFile );
  }

  // member methods

  // output to the ESTK console
  // note that it behaves a bit differently 
  // when using the BridgeTalk section
  this.print = function( inMessage ) { 
    if ( app.name == "ExtendScript Toolkit" ) {
      print (inMessage);
    } else {
      var btMessage = new BridgeTalk();
      btMessage.target = "estoolkit";
      btMessage.body = "print(" + inMessage.toSource() + ")";
      btMessage.send ();
    }
  }

  // write out a message to the log file
  this.log = function( inMessage ) {
    if ( this.file.exists ) {
      this.file.open( 'e' );
      this.file.seek( 0, 2 ); // end of file
    } else {
      this.file.open( 'w' );
    }
    this.file.write( inMessage );
    this.file.close();
  }

  // show the contents with the execute method
  this.display = function() {
    this.file.execute();
  }

  // remove the file
  this.remove = function() {
    this.file.remove();
  }
}


