$(function(){
    //ajax 获取数据
    var url = 'http://192.168.3.75:9200/api/v1/forward_domain/';
    getData(url);
    $(document).on('click','.btn-forward',function(){
        var forward_attr = $(this).attr('title');
        if(forward_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            var content = {};
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                var val = $(val).text();
                content[title] = val;
            });
            console.log(content);
            var forward_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">转发域名</h4></div>'+
                '<div class="modal-body">'+
                '<form class="form-horizontal form-label-left" action="'+content.id+'/update" method="post" onsubmit="return resubmit()">';
            var forward_name = '<div class="form-group">'+
                       '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">转发域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="domain" value="'+content.domain+'" readonly>'+
                        '</div>'+
                    '</div>';
            var forward_server = '<div class="form-group">'+
                                '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">NS</label>'+
                                '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                    '<input type="text" id="type" required="required" class="form-control col-md-7 col-xs-12" name="server" value="'+content.server+'" readonly>'+
                                '</div>'+
                               '</div>';
            //判断content.only
            if(content.only == 'True'){
                var only_input = '<input type="radio" class="switch-input" name="only" value="1" id="onlyone" checked>'+
                                    '<label for="onlyone" class="switch-label switch-label-off">转发</label>'+
                                    '<input type="radio" class="switch-input" name="only" value="0" id="onlyzero">'+
                                    '<label for="onlyzero" class="switch-label switch-label-on">关闭</label>'+
                                    '<span class="switch-selection"></span>';
            }else{
                var only_input = '<input type="radio" class="switch-input" name="only" value="1" id="onlyone">'+
                                    '<label for="onlyone" class="switch-label switch-label-off">转发</label>'+
                                    '<input type="radio" class="switch-input" name="only" value="0" id="onlyzero" checked>'+
                                    '<label for="onlyzero" class="switch-label switch-label-on">关闭</label>'+
                                    '<span class="switch-selection"></span>'; 
            } ;                  
            var forward_only =  '<div class="form-group">'+
                                '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">仅转发</label>'+
                                '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                    '<div class="switch switch-blue">'+only_input+'</div>'+
                                '</div>'+
                            '</div>';
            //判断content.status
            if(content.status == 'True'){
                var status_input = '<input type="radio" class="switch-input" name="status" value="1" id="addoneu" checked>'+
                                '<label for="addoneu" class="switch-label switch-label-off">开启</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzerou">'+
                                '<label for="addzerou" class="switch-label switch-label-on">关闭</label>'+
                                '<span class="switch-selection"></span>';
            }else{
                var status_input = '<input type="radio" class="switch-input" name="status" value="1" id="addoneu" >'+
                        '<label for="addoneu" class="switch-label switch-label-off">开启</label>'+
                        '<input type="radio" class="switch-input" name="status" value="0" id="addzerou" checked>'+
                        '<label for="addzerou" class="switch-label switch-label-on">关闭</label>'+
                        '<span class="switch-selection"></span>';
            };

            var forward_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">是否启用</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+status_input+'</div>'+
                        '</div></div>';

            var forward_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success">确定</button>'+
                            '</div></div></form></div>';

            var forward_html = forward_header+forward_name+forward_server+forward_only+forward_status+forward_footer;
            $('#modal-forward').html(forward_html);
        }else if(forward_attr == 'upload'){

            var forward_header = '<div class="modal-header">'+
                                 '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                                 '<h4 class="modal-title" id="myModalLabel">批量导入</h4></div>'+
                                 '<div class="modal-body">'+
                                 '<form  class="form-horizontal" action="impt" method="POST" enctype="multipart/form-data" onsubmit="return resubmit()">';

            var forward_csv = '<div class="form-group">'+
                              '<label for="dforward" class="col-sm-2 control-label">请选择.csv格式</label>'+
                              '<div class="col-md-8 col-sm-8 col-xs-12">'+
                                    '<input type="file" name="dforward" accept=".csv" id="dforward">'+
                              '</div></div>';
            var forward_img = '<div class="form-group">'+
                              '<label for="dforward" class="col-sm-2 control-label">示例</label>'+
                              '<div class="col-md-8 col-sm-8 col-xs-12">'+
                                    '<img src="/static/recadmin/image/dforward.png" title="示例">'+
                              '</div></div>';                  
            var forward_footer = '<div class="ln_solid"></div>'+
                                  '<div class="form-group">'+
                                    '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                        '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                                        '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                        '<button type="submit" class="btn btn-success">确定</button>'+
                                    '</div></div></form></div>';
            var forward_html = forward_header+forward_csv+forward_img+forward_footer;
            $('#modal-forward').html(forward_html);                        
        }

    });
    $(document).on('click','.btn-success',function(){
        $('.btn-success').attr('disabled',true);
        var data = {
            domain:null,
            server:null,
            only:null,
            status:null,
        };
        data.domain = $('input[name="domain"]').val();
        data.server = $('input[name="server"]').val();
        data.only = $('input[name="only"]:checked').val();
        data.status = $('input[name="status"]:checked').val();
        $('.modal-dforward').css('display','none');
        $('.nav-md').removeClass("modal-open");
        $('.modal-backdrop').remove();

        $.ajax({
            url:url,
            type:'post',
            dataType:'json',
            data:data,
            success: function(data) {
                var id = data.id,
                domain = data.domain,
                server = data.server,
                only = data.only,
                status = data.status;
                dom='<tr class="even pointer">'+
                    '<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+id+'</td>'+
                    '<td class="d-content" title="domain">'+domain+'</td>'+
                    '<td class="d-content" title="server">'+server+'</td>'+
                    '<td class="d-content" title="only">'+only+'</td>'+
                    '<td class="d-content" title="status">'+status+'</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn-forward" data-toggle="modal" data-target=".modal-dforward" title="update">更新</button>'+
                    '| <button type="button" class="btn-forward" title="delete">删除</button>'+
                    '</tr>';
                $('#sho').append(dom);
                $('.btn-success').attr('disabled',false);
            },
            error: function(err) {
                console.log(err);
                $('.btn-success').attr('disabled',false);
            }
        });
    });

});

function getData(url){

    $.ajax({
        url:url,
        type: 'GET',
        dataType: 'json',
        headers:{
            'Authorization': 'Token a5411a3756d0891e19e02908626a7b6a8ca6e6dd'
        },
        success: function(data) {
            renderDom(data);
        },
        error:  function(err) {
            console.log(err);
        }
    });
}

function renderDom(data){
    var dom = '';
    $.each(data,function(key,val){
        var id = val.id,
        domain = val.domain,
        server = val.server,
        only = val.only,
        status = val.status;
        dom+='<tr class="even pointer">'+
            '<td class="a-center ">'+
                '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
            '</td>'+
            '<td class="d-content" title="id">'+id+'</td>'+
            '<td class="d-content" title="domain">'+domain+'</td>'+
            '<td class="d-content" title="server">'+server+'</td>'+
            '<td class="d-content" title="only">'+only+'</td>'+
            '<td class="d-content" title="status">'+status+'</td>'+
            '<td class="last">'+
            '<button type="button" class="btn-forward" data-toggle="modal" data-target=".modal-dforward" title="update">更新</button>'+
            '| <button type="button" class="btn-forward" title="delete">删除</button>'+
        '</tr>';
    });
    $('#sho').html(dom);

}



