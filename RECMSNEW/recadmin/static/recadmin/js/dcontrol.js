$(function(){
    $('.btn-control').on('click',function(){
        var control_attr = $(this).attr('title');
        if(control_attr == 'add'){
            var control_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">访问控制管理</h4></div>'+
                '<div class="modal-body">'+
                '<form class="form-horizontal form-label-left" action="add" method="post" onsubmit="return resubmit()">';
                
            var control_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name">'+
                        '</div></div>';
            var control_acl = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="acl">用户地址段</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="acl" required="required" class="form-control col-md-7 col-xs-12 validation" name="acl" title="acl">'+
                        '</div></div>';
            var control_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">是否启用</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+
                                '<input type="radio" class="switch-input" name="status" value="1" id="addone" checked>'+
                                '<label for="addone" class="switch-label switch-label-off">开启</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzero">'+
                                '<label for="addzero" class="switch-label switch-label-on">关闭</label>'+
                                '<span class="switch-selection"></span>'+
                            '</div></div></div>';

            var control_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success">确定</button>'+
                            '</div></div></form></div>';

            var control_html = control_header+control_name+control_acl+control_status+control_footer;
            $('#modal-control').html(control_html);             
        }else if(control_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            var content = {};
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                var val = $(val).text();
                content[title] = val;
            });
            console.log(content);
            var control_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">访问控制管理</h4></div>'+
                '<div class="modal-body">'+
                '<form class="form-horizontal form-label-left" action="'+content.id+'/update" method="post" onsubmit="return resubmit()">';
            var control_name = '<div class="form-group">'+
                       '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" value="'+content.name+'">'+
                        '</div>'+
                    '</div>';
            var control_acl = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="acl">acl</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="acl" required="required" class="form-control col-md-7 col-xs-12" name="acl" value="'+content.acl+'" readonly>'+
                        '</div></div>';
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

            var control_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">是否启用</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+status_input+'</div>'+
                        '</div></div>';

            var control_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success">确定</button>'+
                            '</div></div></form></div>';

            var control_html = control_header+control_name+control_acl+control_status+control_footer;
            $('#modal-control').html(control_html); 
        }

    });

}); 
 