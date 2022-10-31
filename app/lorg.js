(function ($hx_exports, $global) { "use strict";
$hx_exports["Lorg"] = $hx_exports["Lorg"] || {};
function $extend(from, fields) {
	var proto = Object.create(from);
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var Config = $hx_exports["Lorg"]["Config"] = function() {
	this.toJson = false;
	this.prettify = false;
	this.displayTotalNode = false;
	this.printVersion = false;
};
Config.__name__ = true;
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) {
		return undefined;
	}
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(len == null) {
		len = s.length;
	} else if(len < 0) {
		if(pos == 0) {
			len = s.length + len;
		} else {
			return "";
		}
	}
	return s.substr(pos,len);
};
HxOverrides.now = function() {
	return Date.now();
};
var Library = $hx_exports["Lorg"] = function() { };
Library.__name__ = true;
Library.createParser = function(config) {
	return new Parser(config);
};
Library.createConfig = function() {
	return new Config();
};
Math.__name__ = true;
var Node = function(title) {
	this.title = title;
	this.children = [];
	this.units = new haxe_ds_StringMap();
};
Node.__name__ = true;
var Parser = $hx_exports["Lorg"]["Parser"] = function(config) {
	this.UNIT_NAME_VALUE_SEPARATOR = ":";
	this.UNIT_DEFINITION_CHARACTER = "$";
	this.NODE_DEFINITION_CHARACTER = "#";
	this.INDENTATION_STEP = "    ";
	this.config = config;
	this.reset();
};
Parser.__name__ = true;
Parser.prototype = {
	reset: function() {
		this.totalNode = new Node("TOTAL");
		this.existingUnits = new haxe_ds_StringMap();
		this.sortedUnitNames = [];
		this.hasError = false;
		this.errorMessage = "";
	}
	,parse: function(content) {
		try {
			this.reset();
			this.extractTotalNodeFromText(content);
			this.calculateNodeUnits(this.totalNode,new haxe_ds_StringMap());
			var h = this.existingUnits.h;
			var name_h = h;
			var name_keys = Object.keys(h);
			var name_length = name_keys.length;
			var name_current = 0;
			while(name_current < name_length) {
				var name = name_keys[name_current++];
				this.sortedUnitNames.push(name);
				this.sortedUnitNames.sort(function(a,b) {
					if(a < b) {
						return -1;
					} else {
						return 1;
					}
				});
			}
		} catch( _g ) {
			var e = haxe_Exception.caught(_g).unwrap();
			this.hasError = true;
			this.errorMessage = Std.string(e);
		}
	}
	,getResultAsString: function() {
		var _gthis = this;
		var nodesToConvert = this.getNodesToConvert();
		var convert = this.config.prettify ? function(node) {
			return _gthis.convertNodeToStringPretty(node);
		} : function(node) {
			return _gthis.convertNodeToStringSimple(node);
		};
		var lines = [];
		var _g = 0;
		var _g1 = this.getNodesToConvert();
		while(_g < _g1.length) {
			var node = _g1[_g];
			++_g;
			var nodeLines = convert(node);
			var _g2 = 0;
			while(_g2 < nodeLines.length) {
				var line = nodeLines[_g2];
				++_g2;
				lines.push(line);
			}
		}
		return lines.join("\n");
	}
	,getResultAsJson: function() {
		var nodesToConvert = this.getNodesToConvert();
		if(this.config.prettify) {
			return this.getJsonPretty(nodesToConvert);
		} else {
			return this.getJson(nodesToConvert);
		}
	}
	,escapeJson: function(str) {
		var escaped = "";
		var _g = 0;
		var _g1 = str.length;
		while(_g < _g1) {
			var i = _g++;
			var c = str.charAt(i);
			var code = HxOverrides.cca(str,i);
			if(c == "\"") {
				escaped += "\\\"";
			} else if(c == "\\") {
				escaped += "\\\\";
			} else if(c == "\n") {
				escaped += "\\n";
			} else if(c == "\r") {
				escaped += "\\r";
			} else if(c == "\t") {
				escaped += "\\t";
			} else if(0 <= code && code <= 31) {
				escaped += "\\u00";
				if(0 <= code && code < 16) {
					escaped += "0";
				} else {
					escaped += "1";
					code -= 16;
				}
				if(0 <= code && code < 10) {
					escaped += "" + code;
				} else if(code == 10) {
					escaped += "a";
				} else if(code == 11) {
					escaped += "b";
				} else if(code == 12) {
					escaped += "c";
				} else if(code == 13) {
					escaped += "d";
				} else if(code == 14) {
					escaped += "e";
				} else if(code == 15) {
					escaped += "f";
				}
			} else {
				escaped += c;
			}
		}
		return escaped;
	}
	,getJsonUnit: function(unit) {
		var result = "";
		var escapedUnitName = this.escapeJson(unit.name);
		result += "\"" + escapedUnitName + "\":" + "{";
		result += "\"name\":\"" + escapedUnitName + "\",";
		result += "\"value\":" + unit.value + ",";
		result += "\"isReal\":" + (unit.isReal == null ? "null" : "" + unit.isReal) + ",";
		result += "\"isIgnored\":" + (unit.isIgnored == null ? "null" : "" + unit.isIgnored);
		result += "}";
		return result;
	}
	,getJsonNode: function(node) {
		var result = "{";
		result += "\"title\":\"" + this.escapeJson(node.title) + "\"";
		result += ",\"units\":{";
		var separator = "";
		var _g = 0;
		var _g1 = this.sortedUnitNames;
		while(_g < _g1.length) {
			var name = _g1[_g];
			++_g;
			result += separator;
			result += this.getJsonUnit(node.units.h[name]);
			separator = ",";
		}
		result += "}";
		result += ",\"children\":[";
		if(node.children.length > 0) {
			var _g = 0;
			var _g1 = node.children.length - 1;
			while(_g < _g1) {
				var i = _g++;
				result += this.getJsonNode(node.children[i]);
				result += ",";
			}
			result += this.getJsonNode(node.children[node.children.length - 1]);
		}
		result += "]";
		result += "}";
		return result;
	}
	,getJson: function(nodesToConvert) {
		var result = "[";
		if(nodesToConvert.length > 0) {
			var _g = 0;
			var _g1 = nodesToConvert.length - 1;
			while(_g < _g1) {
				var i = _g++;
				result += this.getJsonNode(nodesToConvert[i]);
				result += ",";
			}
			result += this.getJsonNode(nodesToConvert[nodesToConvert.length - 1]);
		}
		result += "]";
		return result;
	}
	,getJsonPrettyNode: function(node,indentation,hasSibling) {
		var indentationKey = indentation + this.INDENTATION_STEP;
		var indentationValue = indentation + this.INDENTATION_STEP + this.INDENTATION_STEP;
		var result = indentation + "{\n";
		result += "" + indentationKey + "\"title\": \"" + this.escapeJson(node.title) + "\",\n";
		var h = node.units.h;
		var inlStringMapKeyIterator_h = h;
		var inlStringMapKeyIterator_keys = Object.keys(h);
		var inlStringMapKeyIterator_length = inlStringMapKeyIterator_keys.length;
		var inlStringMapKeyIterator_current = 0;
		if(inlStringMapKeyIterator_current >= inlStringMapKeyIterator_length) {
			result += "" + indentationKey + "\"units\": {},\n";
		} else {
			result += "" + indentationKey + "\"units\": " + "{\n";
			var isFirst = true;
			var _g = 0;
			var _g1 = this.sortedUnitNames;
			while(_g < _g1.length) {
				var name = _g1[_g];
				++_g;
				var unit = node.units.h[name];
				var escapedUnitName = this.escapeJson(unit.name);
				var i = indentationValue;
				var iv = i + this.INDENTATION_STEP;
				if(isFirst) {
					isFirst = false;
				} else {
					result += i + "},\n";
				}
				result += "" + i + "\"" + escapedUnitName + "\": " + "{\n";
				result += "" + iv + "\"name\": \"" + escapedUnitName + "\",\n";
				result += "" + iv + "\"value\": " + unit.value + ",\n";
				result += "" + iv + "\"isReal\": " + (unit.isReal == null ? "null" : "" + unit.isReal) + ",\n";
				result += "" + iv + "\"isIgnored\": " + (unit.isIgnored == null ? "null" : "" + unit.isIgnored) + "\n";
			}
			var h = node.units.h;
			var inlStringMapKeyIterator_h = h;
			var inlStringMapKeyIterator_keys = Object.keys(h);
			var inlStringMapKeyIterator_length = inlStringMapKeyIterator_keys.length;
			var inlStringMapKeyIterator_current = 0;
			if(inlStringMapKeyIterator_current < inlStringMapKeyIterator_length) {
				result += indentationValue + "}\n";
			}
			result += indentationKey + "},\n";
		}
		if(node.children.length == 0) {
			result += "" + indentationKey + "\"children\": []\n";
		} else {
			result += "" + indentationKey + "\"children\": [\n";
			var _g = 0;
			var _g1 = node.children.length - 1;
			while(_g < _g1) {
				var i = _g++;
				result += this.getJsonPrettyNode(node.children[i],indentationValue,true);
			}
			result += this.getJsonPrettyNode(node.children[node.children.length - 1],indentationValue,false);
			result += "" + indentationKey + "]\n";
		}
		if(hasSibling) {
			result += indentation + "},\n";
		} else {
			result += indentation + "}\n";
		}
		return result;
	}
	,getJsonPretty: function(nodesToConvert) {
		var result = "[\n";
		if(nodesToConvert.length > 0) {
			var _g = 0;
			var _g1 = nodesToConvert.length - 1;
			while(_g < _g1) {
				var i = _g++;
				result += this.getJsonPrettyNode(nodesToConvert[i],this.INDENTATION_STEP,true);
			}
			result += this.getJsonPrettyNode(nodesToConvert[nodesToConvert.length - 1],this.INDENTATION_STEP,false);
		}
		result += "]";
		return result;
	}
	,getNodesToConvert: function() {
		if(this.config.displayTotalNode) {
			return [this.totalNode];
		} else {
			return this.totalNode.children;
		}
	}
	,isWhitespace: function(c) {
		if(c != " ") {
			return c == "\t";
		} else {
			return true;
		}
	}
	,isEndOfLine: function(c) {
		if(c != "\n") {
			return c == "";
		} else {
			return true;
		}
	}
	,skipWhitespaces: function(stream) {
		while(true) {
			var c = stream.peek();
			if(!(c == " " || c == "\t")) {
				break;
			}
			stream.get();
		}
	}
	,skipLine: function(stream) {
		while(true) {
			var c = stream.peek();
			if(c == "\n" || c == "") {
				break;
			}
			stream.get();
		}
	}
	,isDigit: function(charCode) {
		if(48 <= charCode) {
			return charCode <= 57;
		} else {
			return false;
		}
	}
	,isUnitValueOK: function(value) {
		if(value.length == 0) {
			return false;
		}
		var i = 0;
		if(value.charAt(0) == "-" || value.charAt(0) == "+") {
			i = 1;
		}
		while(i < value.length) {
			var charCode = HxOverrides.cca(value,i);
			if(48 <= charCode && charCode <= 57) {
				++i;
			} else if(value.charAt(i) == ".") {
				break;
			} else {
				return false;
			}
		}
		if(i == value.length && value.charAt(value.length - 1) != ".") {
			return true;
		}
		if(i == value.length - 1 && value.charAt(i) == ".") {
			return false;
		}
		var _g = i + 1;
		var _g1 = value.length;
		while(_g < _g1) {
			var j = _g++;
			var charCode = HxOverrides.cca(value,j);
			if(!(48 <= charCode && charCode <= 57)) {
				return false;
			}
		}
		return true;
	}
	,getRestOfLineWithoutTrailingSpaces: function(stream,firstChar) {
		var content = "";
		var c = firstChar;
		var trailingSpaceCount = 0;
		while(!(c == "\n" || c == "")) {
			content += c;
			if(c == " " || c == "\t") {
				++trailingSpaceCount;
			} else {
				trailingSpaceCount = 0;
			}
			c = stream.get();
		}
		if(trailingSpaceCount > 0) {
			content = HxOverrides.substr(content,0,content.length - trailingSpaceCount);
		}
		return content;
	}
	,getSubstringWithoutLeadingTrailingSpaces: function(str,start,end) {
		var substring = str.substring(start,end);
		return StringTools.trim(substring);
	}
	,formatError: function(message,line,column) {
		if(column == null) {
			column = 0;
		}
		var errorMessage = "Line " + line;
		if(column != 0) {
			errorMessage += ", column " + column;
		}
		errorMessage += ": " + message;
		return errorMessage;
	}
	,throwNodeWithoutTitle: function(line) {
		throw haxe_Exception.thrown(this.formatError("The node has no title.",line));
	}
	,throwNodeWithoutDirectParent: function(line) {
		throw haxe_Exception.thrown(this.formatError("The node is not a direct descendant to any other node.",line));
	}
	,throwUnitDefinitionIllFormed: function(line) {
		var errorMessage = this.formatError("The unit definition is ill-formed.",line);
		errorMessage += "\nThe unit defintion should follow this format:";
		errorMessage += "\n    $ UNIT_NAME : UNIT_VALUE";
		throw haxe_Exception.thrown(errorMessage);
	}
	,extractTotalNodeFromText: function(content) {
		var stream = new StringStream(content);
		var nodesToAdd = new Stack();
		while(!stream.eof()) {
			var tmp;
			if(stream.column == 0) {
				var c = stream.peek();
				tmp = c == " " || c == "\t";
			} else {
				tmp = false;
			}
			if(tmp) {
				this.skipWhitespaces(stream);
				if(stream.eof()) {
					break;
				}
			}
			var c1 = stream.get();
			if(c1 == this.NODE_DEFINITION_CHARACTER) {
				var currentLine = stream.line;
				var level = 0;
				while(c1 == this.NODE_DEFINITION_CHARACTER) {
					++level;
					c1 = stream.get();
				}
				if(c1 == " " || c1 == "\t") {
					this.skipWhitespaces(stream);
				}
				c1 = stream.get();
				if(c1 == "\n" || c1 == "") {
					throw haxe_Exception.thrown(this.formatError("The node has no title.",currentLine));
				}
				var title = this.getRestOfLineWithoutTrailingSpaces(stream,c1);
				if(level > nodesToAdd.get_length() + 1) {
					throw haxe_Exception.thrown(this.formatError("The node is not a direct descendant to any other node.",currentLine));
				}
				while(level < nodesToAdd.get_length() + 1) {
					var other = nodesToAdd.get_top();
					nodesToAdd.pop();
					if(nodesToAdd.get_length() > 0) {
						nodesToAdd.get_top().children.push(other);
					} else {
						this.totalNode.children.push(other);
					}
				}
				var currentNode = new Node(title);
				nodesToAdd.push(currentNode);
			} else if(c1 == this.UNIT_DEFINITION_CHARACTER) {
				var currentLine1 = stream.line;
				this.skipWhitespaces(stream);
				var definition = this.getRestOfLineWithoutTrailingSpaces(stream,stream.get());
				if(definition.length == 0) {
					var errorMessage = this.formatError("The unit definition is ill-formed.",currentLine1);
					errorMessage += "\nThe unit defintion should follow this format:";
					errorMessage += "\n    $ UNIT_NAME : UNIT_VALUE";
					throw haxe_Exception.thrown(errorMessage);
				}
				var separatorIndex = definition.length - 1;
				while(separatorIndex > 0) {
					if(definition.charAt(separatorIndex) == this.UNIT_NAME_VALUE_SEPARATOR) {
						break;
					}
					--separatorIndex;
				}
				if(definition.charAt(separatorIndex) != this.UNIT_NAME_VALUE_SEPARATOR) {
					var errorMessage1 = this.formatError("The unit definition is ill-formed.",currentLine1);
					errorMessage1 += "\nThe unit defintion should follow this format:";
					errorMessage1 += "\n    $ UNIT_NAME : UNIT_VALUE";
					throw haxe_Exception.thrown(errorMessage1);
				}
				if(definition.length == 1) {
					var errorMessage2 = this.formatError("The unit definition is ill-formed.",currentLine1);
					errorMessage2 += "\nThe unit defintion should follow this format:";
					errorMessage2 += "\n    $ UNIT_NAME : UNIT_VALUE";
					throw haxe_Exception.thrown(errorMessage2);
				}
				var name = this.getSubstringWithoutLeadingTrailingSpaces(definition,0,separatorIndex);
				if(name.length == 0) {
					var errorMessage3 = this.formatError("The unit definition is ill-formed.",currentLine1);
					errorMessage3 += "\nThe unit defintion should follow this format:";
					errorMessage3 += "\n    $ UNIT_NAME : UNIT_VALUE";
					throw haxe_Exception.thrown(errorMessage3);
				}
				var valueString = this.getSubstringWithoutLeadingTrailingSpaces(definition,separatorIndex + 1,definition.length);
				if(valueString.length == 0) {
					var errorMessage4 = this.formatError("The unit definition is ill-formed.",currentLine1);
					errorMessage4 += "\nThe unit defintion should follow this format:";
					errorMessage4 += "\n    $ UNIT_NAME : UNIT_VALUE";
					throw haxe_Exception.thrown(errorMessage4);
				}
				if(!this.isUnitValueOK(valueString)) {
					var errorMessage5 = this.formatError("The unit definition is ill-formed.",currentLine1);
					errorMessage5 += "\nThe unit defintion should follow this format:";
					errorMessage5 += "\n    $ UNIT_NAME : UNIT_VALUE";
					throw haxe_Exception.thrown(errorMessage5);
				}
				if(nodesToAdd.data.length == 0) {
					var errorMessage6 = this.formatError("The unit definition is ill-formed.",currentLine1);
					errorMessage6 += "\nThe unit defintion should follow this format:";
					errorMessage6 += "\n    $ UNIT_NAME : UNIT_VALUE";
					throw haxe_Exception.thrown(errorMessage6);
				}
				var unit = new Unit(name,parseFloat(valueString),true);
				nodesToAdd.get_top().units.h[name] = unit;
				this.existingUnits.h[name] = true;
			} else if(c1 == "\n") {
				continue;
			} else {
				this.skipLine(stream);
			}
		}
		if(nodesToAdd.data.length != 0) {
			while(nodesToAdd.get_length() > 1) {
				var other = nodesToAdd.get_top();
				nodesToAdd.pop();
				nodesToAdd.get_top().children.push(other);
			}
			this.totalNode.children.push(nodesToAdd.get_top());
			nodesToAdd.pop();
		}
	}
	,calculateNodeUnits: function(node,ignoredUnits) {
		var calculatedUnitNames = [];
		var h = this.existingUnits.h;
		var name_h = h;
		var name_keys = Object.keys(h);
		var name_length = name_keys.length;
		var name_current = 0;
		while(name_current < name_length) {
			var name = name_keys[name_current++];
			if(!Object.prototype.hasOwnProperty.call(node.units.h,name)) {
				var this1 = node.units;
				var v = new Unit(name,0,false);
				this1.h[name] = v;
				calculatedUnitNames.push(name);
			}
		}
		var h = ignoredUnits.h;
		var name_h = h;
		var name_keys = Object.keys(h);
		var name_length = name_keys.length;
		var name_current = 0;
		while(name_current < name_length) {
			var name = name_keys[name_current++];
			node.units.h[name].isIgnored = true;
		}
		if(node.children.length == 0) {
			return;
		}
		var childrenUnitsToIgnore = new haxe_ds_StringMap();
		var h = node.units.h;
		var name_h = h;
		var name_keys = Object.keys(h);
		var name_length = name_keys.length;
		var name_current = 0;
		while(name_current < name_length) {
			var name = name_keys[name_current++];
			if(node.units.h[name].isReal || node.units.h[name].isIgnored) {
				childrenUnitsToIgnore.h[name] = true;
			}
		}
		var _g = 0;
		var _g1 = node.children;
		while(_g < _g1.length) {
			var child = _g1[_g];
			++_g;
			this.calculateNodeUnits(child,childrenUnitsToIgnore);
			var _g2 = 0;
			while(_g2 < calculatedUnitNames.length) {
				var name = calculatedUnitNames[_g2];
				++_g2;
				node.units.h[name].value += child.units.h[name].value;
			}
		}
	}
	,unitToString: function(unit) {
		var str = "$ " + unit.name + ": " + unit.value;
		if(!unit.isReal) {
			str += " [Calculated]";
		}
		if(unit.isIgnored) {
			str += " [Ignored]";
		}
		return str;
	}
	,convertNodeToStringSimple: function(node,indentLevel) {
		if(indentLevel == null) {
			indentLevel = 0;
		}
		var lines = [];
		var heading = "#";
		var indent = "";
		var _g = 0;
		var _g1 = indentLevel;
		while(_g < _g1) {
			var i = _g++;
			heading += "#";
			indent += "  ";
		}
		lines.push("" + indent + heading + " " + node.title);
		var _g = 0;
		var _g1 = this.sortedUnitNames;
		while(_g < _g1.length) {
			var name = _g1[_g];
			++_g;
			var unit = node.units.h[name];
			var str = "$ " + unit.name + ": " + unit.value;
			if(!unit.isReal) {
				str += " [Calculated]";
			}
			if(unit.isIgnored) {
				str += " [Ignored]";
			}
			var unitStr = str;
			lines.push("" + indent + "  " + unitStr);
		}
		var _g = 0;
		var _g1 = node.children.length;
		while(_g < _g1) {
			var i = _g++;
			var child = node.children[i];
			var childLines = this.convertNodeToStringSimple(child,indentLevel + 1);
			var _g2 = 0;
			while(_g2 < childLines.length) {
				var line = childLines[_g2];
				++_g2;
				lines.push(line);
			}
		}
		return lines;
	}
	,convertNodeToStringPretty: function(node,indentLevel,prefixFromParent,hasNextSibling) {
		if(hasNextSibling == null) {
			hasNextSibling = false;
		}
		if(prefixFromParent == null) {
			prefixFromParent = "";
		}
		if(indentLevel == null) {
			indentLevel = 0;
		}
		var lines = [];
		if(indentLevel == 0) {
			lines.push("" + node.title);
		} else if(hasNextSibling) {
			lines.push("" + prefixFromParent + "├── " + node.title);
		} else {
			lines.push("" + prefixFromParent + "└── " + node.title);
		}
		var prefixForNextLines = "";
		if(indentLevel == 0) {
			prefixForNextLines = "";
		} else {
			var toAdd = hasNextSibling ? "│   " : "    ";
			prefixForNextLines = prefixFromParent + toAdd;
		}
		var _g = 0;
		var _g1 = this.sortedUnitNames;
		while(_g < _g1.length) {
			var name = _g1[_g];
			++_g;
			var unit = node.units.h[name];
			var str = "$ " + unit.name + ": " + unit.value;
			if(!unit.isReal) {
				str += " [Calculated]";
			}
			if(unit.isIgnored) {
				str += " [Ignored]";
			}
			var unitStr = str;
			if(node.children.length != 0) {
				lines.push("" + prefixForNextLines + "│ " + unitStr);
			} else {
				lines.push("" + prefixForNextLines + "  " + unitStr);
			}
		}
		var _g = 0;
		var _g1 = node.children.length;
		while(_g < _g1) {
			var i = _g++;
			var child = node.children[i];
			var childHasNextSibling = i < node.children.length - 1;
			var childLines = this.convertNodeToStringPretty(child,indentLevel + 1,prefixForNextLines,childHasNextSibling);
			var _g2 = 0;
			while(_g2 < childLines.length) {
				var line = childLines[_g2];
				++_g2;
				lines.push(line);
			}
		}
		return lines;
	}
};
var Stack = function() {
	this.data = [];
};
Stack.__name__ = true;
Stack.prototype = {
	get_length: function() {
		return this.data.length;
	}
	,get_top: function() {
		if(this.data.length == 0) {
			return null;
		} else {
			return this.data[this.data.length - 1];
		}
	}
	,pop: function() {
		this.data.pop();
	}
	,push: function(t) {
		this.data.push(t);
	}
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var StringStream = function(stringReference) {
	this.line = 0;
	this.column = 0;
	this.peekLine = 1;
	this.peekColumn = 1;
	this.index = 0;
	this.s = stringReference;
	if(this.s.length == 0) {
		this.peekLine = 0;
		this.peekColumn = 0;
		return;
	}
	while(this.index < this.s.length && StringStream.IGNORED_CHARACTERS.indexOf(this.s.charAt(this.index)) != -1) {
		this.index++;
		this.peekColumn++;
	}
	if(!this.eof()) {
		if(this.s.charAt(this.index) == "\n") {
			this.peekLine++;
			this.peekColumn = 0;
		}
	}
};
StringStream.__name__ = true;
StringStream.prototype = {
	eof: function() {
		return this.index >= this.s.length;
	}
	,get: function() {
		if(this.eof()) {
			return "";
		}
		var c = this.s.charAt(this.index);
		this.line = this.peekLine;
		this.column = this.peekColumn;
		this.index++;
		this.peekColumn++;
		while(this.index < this.s.length && StringStream.IGNORED_CHARACTERS.indexOf(this.s.charAt(this.index)) != -1) {
			this.index++;
			this.peekColumn++;
		}
		if(!this.eof()) {
			if(this.s.charAt(this.index) == "\n") {
				this.peekLine++;
				this.peekColumn = 0;
			}
		}
		return c;
	}
	,peek: function() {
		if(this.eof()) {
			return "";
		} else {
			return this.s.charAt(this.index);
		}
	}
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	if(!(c > 8 && c < 14)) {
		return c == 32;
	} else {
		return true;
	}
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) ++r;
	if(r > 0) {
		return HxOverrides.substr(s,r,l - r);
	} else {
		return s;
	}
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) ++r;
	if(r > 0) {
		return HxOverrides.substr(s,0,l - r);
	} else {
		return s;
	}
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
var Unit = function(name,value,isReal) {
	if(isReal == null) {
		isReal = true;
	}
	this.name = name;
	this.value = value;
	this.isReal = isReal;
	this.isIgnored = false;
};
Unit.__name__ = true;
var haxe_Exception = function(message,previous,native) {
	Error.call(this,message);
	this.message = message;
	this.__previousException = previous;
	this.__nativeException = native != null ? native : this;
};
haxe_Exception.__name__ = true;
haxe_Exception.caught = function(value) {
	if(((value) instanceof haxe_Exception)) {
		return value;
	} else if(((value) instanceof Error)) {
		return new haxe_Exception(value.message,null,value);
	} else {
		return new haxe_ValueException(value,null,value);
	}
};
haxe_Exception.thrown = function(value) {
	if(((value) instanceof haxe_Exception)) {
		return value.get_native();
	} else if(((value) instanceof Error)) {
		return value;
	} else {
		var e = new haxe_ValueException(value);
		return e;
	}
};
haxe_Exception.__super__ = Error;
haxe_Exception.prototype = $extend(Error.prototype,{
	unwrap: function() {
		return this.__nativeException;
	}
	,get_native: function() {
		return this.__nativeException;
	}
});
var haxe_ValueException = function(value,previous,native) {
	haxe_Exception.call(this,String(value),previous,native);
	this.value = value;
};
haxe_ValueException.__name__ = true;
haxe_ValueException.__super__ = haxe_Exception;
haxe_ValueException.prototype = $extend(haxe_Exception.prototype,{
	unwrap: function() {
		return this.value;
	}
});
var haxe_ds_StringMap = function() {
	this.h = Object.create(null);
};
haxe_ds_StringMap.__name__ = true;
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
haxe_iterators_ArrayIterator.__name__ = true;
haxe_iterators_ArrayIterator.prototype = {
	hasNext: function() {
		return this.current < this.array.length;
	}
	,next: function() {
		return this.array[this.current++];
	}
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__string_rec = function(o,s) {
	if(o == null) {
		return "null";
	}
	if(s.length >= 5) {
		return "<...>";
	}
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) {
		t = "object";
	}
	switch(t) {
	case "function":
		return "<function>";
	case "object":
		if(((o) instanceof Array)) {
			var str = "[";
			s += "\t";
			var _g = 0;
			var _g1 = o.length;
			while(_g < _g1) {
				var i = _g++;
				str += (i > 0 ? "," : "") + js_Boot.__string_rec(o[i],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( _g ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") {
				return s2;
			}
		}
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		var k = null;
		for( k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) {
			str += ", \n";
		}
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "string":
		return o;
	default:
		return String(o);
	}
};
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
String.__name__ = true;
Array.__name__ = true;
js_Boot.__toStr = ({ }).toString;
Parser.ERROR_UNKNOWN_MESSAGE = "Unknown internal error.";
StringStream.IGNORED_CHARACTERS = ["\r"];
})(typeof exports != "undefined" ? exports : typeof window != "undefined" ? window : typeof self != "undefined" ? self : this, {});
