// NOTE: Not used
function create_mini_editor(container, content, callback) {
  var mini_editor = CodeMirror(container);
  editor.setValue(content);
  editor.on('changes', function() { callback(this); });
}
