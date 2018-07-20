$(function(){

    //更新时保存数据
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var security_domain = new requestData();

    var url = '/api/v1/security_domain/'    
    var type = 'get';
    security_domain.ajaxData(url,type,null,function(data){ 
        window.pooldata = data.Pool;
        renderDom(data.SecurityDomain);
    });


    $(document).on('click','.btn-dsecurity',function(){
        var forward_attr = $(this).attr('title');
        var pooloption  = renderPool(window.pooldata,null);
        if(forward_attr == 'add'){
            var forward_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">白名单</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
                
            var forward_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12 domainVaild" name="domain">'+
                        '</div></div>';
            var forward_server = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">解析服务器</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="server" required="required" class="form-control col-md-7 col-xs-12 ipVaild" name="ns">'+
                        '</div></div>';            
            var forward_pool = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                            '</select></div></div>';             
            var forward_note = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">备注信息</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note">'+
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
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                            '</div></div></div></div>';

            var forward_html = forward_header+forward_name+forward_server+forward_pool+forward_note+forward_status+forward_footer;
            $('#modal-dsecurity').html(forward_html);             
        }else if(forward_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            content.trdom = $(this).parent().parent();
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                 //判断$dom是否含有子节点
                if($(val).children().length != 0){
                    var val = $(val).children().text();
                }else{
                    var val = $(val).text();
                }  
                content[title] = val;
            });
            var pooloption  = renderPool(window.pooldata,content.pool);
            var forward_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">白名单</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            var forward_name = '<div class="form-group">'+
                       '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12" name="domain" value="'+content.domain+'" readonly>'+
                        '</div>'+
                    '</div>';
            var forward_server = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">解析服务器</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="server" required="required" class="form-control col-md-7 col-xs-12" name="ns" value="'+content.ns+'">'+
                        '</div></div>';        
            var forward_pool = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                            '</select></div></div>';        
            var forward_note = '<div class="form-group">'+
                       '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">备注信息</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note" value="'+content.note+'">'+
                        '</div>'+
                    '</div>';        
            //判断content.status
            if(content.status == '启用'){
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
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                            '</div></div></div></div>';

            var forward_html = forward_header+forward_name+forward_server+forward_pool+forward_note+forward_status+forward_footer;
            $('#modal-dsecurity').html(forward_html); 
        }

    });
    //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            domain:null,
            ns:null,
            dgroup:null,
            pool:null,
            note:null,
            status:null
        };
        datas.domain = $('input[name="domain"]').val();
        datas.ns = $('input[name="ns"]').val();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.note = $('input[name="note"]').val();
        datas.status = $('input[name="status"]:checked').val();
        var type = 'post';
        security_domain.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="domain">'+data.domain+'</td>'+
                '<td class="d-content" title="server">'+data.ns+'</td>'+
                '<td class="d-content" title="dgroup">'+data.dgroup+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="note">'+data.note+'</td>'+
                '<td class="d-content" title="status">'+
                (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-dsecurity btn-info btn-xs" data-toggle="modal" data-target=".modal-dsecurity" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
            $('.table tbody').append(html);
            create_icheck();
        });
    });

    //更新
    $(document).on('click','.btn-update',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            domain:null,
            ns:null,
            dgroup:null,
            pool:null,
            note:null,
            status:null
        };
        datas.domain = $('input[name="domain"]').val();
        datas.ns = $('input[name="ns"]').val();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.note = $('input[name="note"]').val();
        datas.status = $('input[name="status"]:checked').val();
        var type = 'put';
        var url = '/api/v1/security_domain/'+content.id+'/';
        security_domain.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html ='<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="domain">'+data.domain+'</td>'+
                '<td class="d-content" title="ns">'+data.ns+'</td>'+
                '<td class="d-content" title="dgroup">'+data.dgroup+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="note">'+data.note+'</td>'+
                '<td class="d-content" title="status">'+
                (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-dsecurity btn-info btn-xs" data-toggle="modal" data-target=".modal-dsecurity" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'
            content.trdom.html(html);  
            create_icheck();
        });
    });

    //删除
    $(document).on('click','.btn-delete',function(){
        $('.btn-delete').attr('disabled',true);
        var dom = $(this).parent().siblings('.d-content');
        var trdom = $(this).parent().parent();
        var dcontent = {};
        $.each(dom,function(key,val){
            var title = $(val).attr('title');
            var val = $(val).text();
            dcontent[title] = val;
        });    
        var type = 'delete';
        var url ='/api/v1/security_domain/'+dcontent.id+'/'
        security_domain.ajaxData(url,type,dcontent,function(data){
            //window.location.reload();
            //删除tr元素
            $('.btn-delete').attr('disabled',false);
            trdom.remove();
        });
    });

}); 


function renderDom(data){
    var data = data;
    var dom = '';
    var html = '';
    $.each(data,function(key,val){
        var id = val.id,
            domain = val.domain,
            ns = val.ns,
            status = val.status,
            dgroup = val.dgroup,
            pool = val.pool.id,
            poolname = val.pool.name,
            note = val.note;
        dom+='<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+id+'</td>'+
                '<td class="d-content" title="domain">'+domain+'</td>'+
                '<td class="d-content" title="ns">'+ns+'</td>'+
                '<td class="d-content" title="dgroup">'+dgroup+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="note">'+note+'</td>'+
                '<td class="d-content" title="status">'+
                (status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-dsecurity btn-info btn-xs" data-toggle="modal" data-target=".modal-dsecurity" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
    });
   /* html = '<table class="table table-striped jambo_table bulk_action">'+
                '<thead>'+
                  '<tr class="headings">'+
                    '<th>'+
                      '<input type="checkbox" id="check-all" class="flat">'+
                    '</th>'+
                    '<th class="column-title">域名</th>'+
                    '<th class="column-title">所属分组</th>'+
                    '<th class="column-title">所属链路</th>'+
                    '<th class="column-title">备注信息</th>'+
                    '<th class="column-title">状态</th>'+
                    '<th class="column-title no-link last"><span class="nobr">操作</span></th>'+
                    '<th class="bulk-actions" colspan="5">'+
                      '<a class="antoo" id="del_data" name="dsecurity" style="color:#fff; font-weight:500;cursor:pointer;">批量删除 ( <span class="action-cnt"> </span> ) <i class="fa fa-chevron-down"></i></a>'+
                    '</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>'+dom+'</tbody></table>';*/
    $('#node1').html(dom);
    create_icheck();
}