var page = 0;
    itemsPerPage = 10;
    avatar = $('#avatar');
    baseUrl = 'https://sampleapp-65ghcsaysse.qiscus.com';
    secretKey = 'dc0c7e608d9a23c3c8012c6c8572e788';

getDataFromApi(page);

function getDataFromApi(page) {
    var url = baseUrl + '/api/v2.1/rest/get_user_list';
    $("<div class='box-loading'><span class='icon-loading'></span> LOADING</div>").appendTo( ('.box-table') );

    $.ajax({
        url: url,
        type: 'get',
        data: {
            limit: itemsPerPage,
            page: page
        },
        headers: {
            QISCUS_SDK_SECRET: secretKey,
            'Content-Type':'application/x-www-form-urlencoded'
        },
        dataType: 'json',
        success: function (data) {
            $('table > tbody').empty();
            $('.box-loading').remove();
            if ($(".box-title > h3 > .total-user").children().length > 0) {
                $(".box-title > h3 > .total-user").empty();
            }
            listingData(data, page);
        }
    });
}

function listingData(data, page) {
    if ($("table > tbody").children().length > 0) {
        $("table > tbody").empty();
    }
    if (data.results.users.length > 0) {
        $("<span> ("+ data.results.meta.total_data +")</span>").appendTo( ('.box-title > h3 > .total-user') );
        $.each(data.results.users, function (index, val) {
            var key = ((page - 1) * itemsPerPage) + (index + 1);
            var username = val.username ? val.username : '-';
            var createDate = DateFormat.format.date(val.created_at, 'dd/MM/yyyy HH:mm:ss')
            var updateDate = DateFormat.format.date(val.updated_at, 'dd/MM/yyyy HH:mm:ss')
            $("<tr><th scope='row'>" + key + "</th><td><img style='margin-right: 10px;' class='img-circle' width='48' height='48' src=" + val.avatar_url + ">" + val.email + "</td><td>" + createDate + "</td><td>" + updateDate + "</td></tr>").appendTo( ('tbody') );
        });
        $('#pagination').twbsPagination({
            totalPages: Math.ceil(data.results.meta.total_data / itemsPerPage),
            onPageClick: function (evt, page) {
                page = page;
                getDataFromApi(page);
            }
        });
    } else {
        $("<tr></tr><tr><td colspan='5' class='text-center'><div class='icon-empty-user'></div><div class='info-empty'>User Data Not Found</div><div class='instruction-empty'>You can add user to use it on your app that using Qiscus SDK</div><div><button type='button' class='btn btn-default' data-toggle='modal' data-target='#createUserModal'><span class='icon-user'></span> Add User </button></div></td></tr>").appendTo( ('tbody') );
    }
}

/**
 * create new user
 */
window.URL = window.URL || window.webkitURL;
function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        const date = new Date(files[i].lastModified);
        avatar.attr('src', window.URL.createObjectURL(files[i]));
        var info = document.createElement("div");
        info.innerHTML = "Size: " + files[i].size + " bytes";
        avatar.parent().append(info);
        avatar = files[i];
    }
}

$('input,textarea').on('keyup change keypress', function () {
    var send        = $('#buttonCreateUser')
    if ($('input#email').val() != '' && $('input#username').val() != '' && $('input#password').val() != '') {
        send.removeClass('disable')
    } else {
        send.addClass('disable')
    }
})

$('#buttonCreateUser').on("click", function () {
    var self = $('#buttonCreateUser');
    var email = $('#email').val();
    var password = $('#password').val();
    var username = $('#username').val();
    var avatar_url = null;
    var file_data = $('#avatar_url').prop('files')[0];
    var form_data = new FormData();
    form_data.append('file', file_data);

    self.empty();
    self.css('background', '#F2994A');
    self.append("<span class='icon-loading icon-loading-white'></span> Creating User");
    self.addClass('disabled');
    $.when(
        $.ajax({
            url: baseUrl + '/api/v2/sdk/upload',
            type: 'POST',
            dataType: 'text',
            contentType: false,
            processData: false,
            data: form_data,
            headers: {
                Authorization: 'Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo4MCwidGltZXN0YW1wIjoiMjAxNy0xMS0yMCAwMzo0OToyNyArMDAwMCJ9.oU1rl9ZX5ZfObuutTl4VTaXa6OmK_OioJOev2AhyvlY',
                QISCUS_SDK_SECRET: secretKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (data) {
                avatar_url = data.results.file.url;
            },
            error: function (error) {

            }
        })
    ).then(
        $.ajax({
            url: baseUrl + '/api/v2/rest/login_or_register',
            method: 'POST',
            type: 'POST',
            data: {
                email: email,
                password: password,
                username: username,
                avatar_url: avatar_url
            },
            headers: {
                QISCUS_SDK_SECRET: secretKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            dataType: 'json',
            success: function (data) {
                $('#createUserModal').modal('hide')
                setTimeout(function () {
                    location.reload()
                }, 1000);
            },
            error: function (error) {
                self.empty();
                self.append('Add User')
                self.css('background', '#2ACB6E');
            }
        })
    );

});