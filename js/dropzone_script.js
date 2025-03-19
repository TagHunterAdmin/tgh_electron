function addDropzone(id, url, token) {
    console.log(url);
    console.log(token);
    var uploadedDocumentMap = {}
    $(id).dropzone({
        url: url,
        maxFilesize: 512, // MB
        addRemoveLinks: true,
        headers: {
            'X-CSRF-TOKEN': token
        },
        success: function (file, response) {
            $('form').append('<input type="hidden" name="document[]" value="' + response.name + '">')
            uploadedDocumentMap[file.name] = response.name
        },
        removedfile: function (file) {
            file.previewElement.remove()
            var name = ''
            if (typeof file.file_name !== 'undefined') {
                name = file.file_name
            } else {
                name = uploadedDocumentMap[file.name]
            }
            $('form').find('input[name="document[]"][value="' + name + '"]').remove()
        },
        init: function () {
       
            console.log('in init');
            //         @if (isset($project) && $project -> document)
            //             var files =
            //                 {!! json_encode($project -> document)!!
            //     }
            //   for(var i in files) {
            //     var file = files[i]
            //     this.options.addedfile.call(this, file)
            //     file.previewElement.classList.add('dz-complete')
            //     $('form').append('<input type="hidden" name="document[]" value="' + file.file_name + '">')
            // }
            // @endif
        }
    });
}