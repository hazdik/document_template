$(document).ready(function() {
  // read manifest
  $.get('manifest.json', function(manifest) {
    window.config = {};
    var properties = manifest.properties;
    properties.forEach(function(p) {
      window.config[p.name] = p.value;
    });

    function loadDoc() {
      // load HTML and append to body canvas
      var document_html = manifest.html[0],
          document_css = manifest.stylesheet[0]

      $.get(document_html, function(html) {
        $('#canvas').append(html);

        function run() {
          // load CSS
          var css = $('<link rel="stylesheet" type="text/css" href="' + document_css + '" />');
          $('body').append(css);

          // load Javascript
          for (var i = 0; i < manifest.javascript.length; i++) {
            var js = manifest.javascript[i];
            var script = $('<script type="text/javascript" src="' + js +'"></script>');
            $('body').append(script);
          }
        }

        function loadData(i) {
          if (i < manifest.data.length) {
            var document_data = manifest.data[i]
            if (document_data.indexOf('.json') !== -1) {
              $.get(document_data, function(data) {
                window.data[document_data] = data;
                loadData(i+1);
              })
            } else if (document_data.indexOf('.csv') !== -1) {
              d3.csv(document_data, function(data) {
                window.data[document_data] = data;
                loadData(i+1);
              });
            } else if (document_data.indexOf('.tsv') !== -1) {
              d3.tsv(document_data, function(data) {
                window.data[document_data] = data;
                loadData(i+1);
              });
            }
          } else {
            if (Object.keys(window.data).length === 1) {
              window.data = window.data[Object.keys(window.data)[0]];
            }
            run();
          }
        }

        window.data = {};
        loadData(0);
      });
    }

    if (manifest.externalLibraries && manifest.externalLibraries.length > 0) {
      function loadExtLib(index) {
        if (index < manifest.externalLibraries.length) {
          var js = manifest.externalLibraries[index];
          $.getScript(js, function() {
            index++;
            loadExtLib(index);
          });
        } else {
          loadDoc();
        }
      }

      loadExtLib(0);
    } else {
      loadDoc();
    }
  });

});
