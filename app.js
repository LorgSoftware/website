function updateResult() {
    var config = Lorg.createConfig();
    config.displayIgnored = !document.getElementById("no-ignored").checked;
    config.displayIgnoredAndCalculated = !document.getElementById("no-ignored-and-calculated").checked;
    config.addIndent = !document.getElementById("no-indent").checked;
    config.displayTotalNode = !document.getElementById("no-total").checked;
    config.prettify = document.getElementById("prettify").checked;
    config.toJson = document.getElementById("to-json").checked;
    config.totalName = document.getElementById("total-name").value;
    var content = document.getElementById("user-editor").value;
    console.log(content);
    var parser = Lorg.createParser(config);
    parser.parse(content);
    if(!parser.hasError) {
        var result;
        if(config.toJson) {
            result = parser.getResultAsJson();
        } else {
            result = parser.getResultAsString();
        }
        document.getElementById("result-display").value = result;
    } else {
        document.getElementById("result-display").value = parser.errorMessage;
    }
}

function initialize() {
    var config = Lorg.createConfig();
    document.getElementById("no-ignored").checked = !config.displayIgnored;
    document.getElementById("no-ignored-and-calculated").checked = !config.displayIgnoredAndCalculated;
    document.getElementById("no-indent").checked = !config.addIndent;
    document.getElementById("no-total").checked = !config.displayTotalNode;
    document.getElementById("prettify").checked = config.prettify;
    document.getElementById("to-json").checked = config.toJson;
    document.getElementById("total-name").value = config.totalName;

    document.getElementById("user-editor").onkeypress = function(e) {
        if(e.key = "Enter" && e.ctrlKey === true) {
            updateResult();
        }
    }
    document.getElementById("user-editor").oninput = function(e) {
        var editor = e.target;
        var text = editor.innerText;
        var lines = text.split('\n');
        for(var i = 0; i < lines.length; i++) {
            var nodeDefinitionRegex = /^\#.*$/;
            console.log(lines[i]);
            lines[i] = lines[i].replace(nodeDefinitionRegex, function(match) {
                console.log(match);
                return '<strong>' + match + '</strong>';
            });
        }
        editor.innerHTML = lines.join("\n");
    };
    document.getElementById("button-submit").onclick = updateResult;
}

initialize();
