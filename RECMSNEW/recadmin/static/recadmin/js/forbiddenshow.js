$(function(){
    $('.btn-forbidden').on('click',function(){
        var forward_attr = $(this).attr('title');
        if(forward_attr == 'add'){
            var forward_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">禁止解析域名</h4></div>'+
                '<div class="modal-body">'+
                '<form class="form-horizontal form-label-left" action="add" method="post" onsubmit="return resubmit()">';
                
            var forward_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">禁止解析域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12 validation" name="domain" title="banzone">'+
                        '</div></div>';
            var forward_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">是否启用</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+
                                '<input type="radio" class="switch-input" name="status" value="1" id="addone" checked>'+
                                '<label for="addone" class="switch-label switch-label-off">开启</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzero">'+
                                '<label for="addzero" class="switch-label switch-label-on">关闭</label>'+
                                '<span class="switch-selection"></span>'+
                            '</div></div></div>';

            var forward_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success">确定</button>'+
                            '</div></div></form></div>';

            var forward_html = forward_header+forward_name+forward_status+forward_footer;
            $('#modal-forbidden').html(forward_html);             
        }else if(forward_attr == 'update'){
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
                '<h4 class="modal-title" id="modal-title">禁止解析域名</h4></div>'+
                '<div class="modal-body">'+
                '<form class="form-horizontal form-label-left" action="'+content.id+'/update" method="post" onsubmit="return resubmit()">';
            var forward_name = '<div class="form-group">'+
                       '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">禁止解析域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12" name="domain" value="'+content.domain+'" readonly>'+
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

            var forward_html = forward_header+forward_name+forward_status+forward_footer;
            $('#modal-forbidden').html(forward_html); 
        }

    });

});  