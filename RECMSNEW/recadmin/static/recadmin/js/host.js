$(function(){

    //更新时保存数据
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var host = new requestData();

    var url = '/api/v1/host/'    
    var type = 'get';
    host.ajaxData(url,type,null,function(data){ 
        renderDom(data);
    });


    //打开模态框，加载html
    $(document).on('click','.btn-host',function(){
        var host_attr = $(this).attr('title');
        if(host_attr == 'add'){
            var host_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">host列表</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
                
            var host_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="zone">主机名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="hostname" required="required" class="form-control col-md-7 col-xs-12" name="hostname">'+
                        '</div></div>';
            var host_type = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="htype">类型</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="htype">'+
                                '<option value="unbound">unbound</option>'+
                                '<option value="master_unbound">master_unbound</option>'+
                                '<option value="master_dnsdist">master_dnsdist</option>'+
                                '<option value="dnsdist">dnsdist</option>'+
                            '</select></div></div>';
            var host_ip = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="ip">ip地址</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="ip" required="required" class="form-control col-md-7 col-xs-12" name="ip">'+
                        '</div></div>';
            var host_user = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="user">用户名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="user" required="required" class="form-control col-md-7 col-xs-12" name="user">'+
                        '</div></div>'; 
            var host_ctrl_conf = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="ctrl_conf">远程控制配置</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="ctrl_conf" required="required" class="form-control col-md-7 col-xs-12" name="ctrl_conf">'+
                        '</div></div>';                       
            var host_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                            '</div></div></div></div>';

            var host_html = host_header+host_ip+host_name+host_user+host_ctrl_conf+host_type+host_footer;
            $('#modal-host').html(host_html);             
        }else if(host_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            content.trdom = $(this).parent().parent();
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                var val = $(val).text();
                content[title] = val;
            });
            var host_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">host列表</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            var host_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="zone">主机名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="hostname" required="required" class="form-control col-md-7 col-xs-12" name="hostname" value="'+content.hostname+'">'+
                        '</div></div>';
            //获取选择类型 content.htype
            var content_htype=option_type(content.htype);
            var host_type = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">类型</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="htype">'+content_htype+'</select></div></div>';
          
            var host_ip = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="ip">ip地址</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="ip" required="required" class="form-control col-md-7 col-xs-12" name="ip" value="'+content.ip+'">'+
                        '</div></div>';
            var host_user = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="user">用户名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="user" required="required" class="form-control col-md-7 col-xs-12" name="user" value="'+content.user+'">'+
                        '</div></div>'; 
            var host_ctrl_conf = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="ctrl_conf">远程控制配置</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="ctrl_conf" required="required" class="form-control col-md-7 col-xs-12" name="ctrl_conf" value="'+content.ctrl_conf+'">'+
                        '</div></div>';                   
            var host_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                            '</div></div></div></div>';

            var host_html = host_header+host_ip+host_name+host_user+host_ctrl_conf+host_type+host_footer;
            $('#modal-host').html(host_html);  
        }

    });

     //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            ip:null,
            user:null,
            ctrl_conf:null,
            hostname:null,
            htype:null
        };
        datas.ip = $('input[name="ip"]').val();
        datas.htype = $('select[name="htype"] option:selected').val();
        datas.user = $('input[name="user"]').val();
        datas.hostname = $('input[name="hostname"]').val();
        datas.ctrl_conf = $('input[name="ctrl_conf"]').val();
        var type = 'post';
        host.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="ip">'+data.ip+'</td>'+
                '<td class="d-content" title="hostname">'+data.hostname+'</td>'+
                '<td class="d-content" title="user">'+data.user+'</td>'+
                '<td class="d-content" title="ctrl_conf">'+data.ctrl_conf+'</td>'+
                '<td class="d-content" title="htype">'+data.htype+'</td>'+
                '<td class="last">'+
                '<button type="button" class="btn-host" data-toggle="modal" data-target=".modal-host" title="update">更新</button>'+
                '| <button type="button" class="btn-delete" title="delete">删除</button>'+
            '</tr>';
            $('.table tbody').append(html);
        });
    });

    //更新
    $(document).on('click','.btn-update',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            ip:null,
            user:null,
            ctrl_conf:null,
            hostname:null,
            htype:null
        };
        datas.ip = $('input[name="ip"]').val();
        datas.htype = $('select[name="htype"] option:selected').val();
        datas.user = $('input[name="user"]').val();
        datas.hostname = $('input[name="hostname"]').val();
        datas.ctrl_conf = $('input[name="ctrl_conf"]').val();
        
        var type = 'put';
        var url = '/api/v1/host/'+content.id+'/';
        host.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = 
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="ip">'+data.ip+'</td>'+
                '<td class="d-content" title="hostname">'+data.hostname+'</td>'+
                '<td class="d-content" title="user">'+data.user+'</td>'+
                '<td class="d-content" title="ctrl_conf">'+data.ctrl_conf+'</td>'+
                '<td class="d-content" title="htype">'+data.htype+'</td>'+
                '<td class="last">'+
                '<button type="button" class="btn-host" data-toggle="modal" data-target=".modal-host" title="update">更新</button>'+
                '| <button type="button" class="btn-delete" title="delete">删除</button>';
            content.trdom.html(html);  
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
        var url ='/api/v1/host/'+dcontent.id+'/'
        host.ajaxData(url,type,dcontent,function(data){
            //window.location.reload();
            //删除tr元素
            trdom.remove();
        });
    });

}); 

function option_type(data){
    var arrayType = ['unbound','master_unbound','master_dnsdist','dnsdist'];
    var htmltype = '';
    for(var i=0;i<arrayType.length;i++){
        if(arrayType[i]==data){
            htmltype+='<option value="'+arrayType[i]+'" selected>'+arrayType[i]+'</option>';
        }else{
            htmltype+='<option value="'+arrayType[i]+'">'+arrayType[i]+'</option>';
        }
    }
    return htmltype;
}

function renderDom(data){
    var data = data;
    var dom = '';
    var html = '';
    $.each(data,function(key,val){
        var id = val.id,
            ip = val.ip,
            hostname = val.hostname,
            user = val.user,
            ctrl_conf = val.ctrl_conf,
            htype = val.htype;
        dom+='<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+id+'</td>'+
                '<td class="d-content" title="ip">'+ip+'</td>'+
                '<td class="d-content" title="hostname">'+hostname+'</td>'+
                '<td class="d-content" title="user">'+user+'</td>'+
                '<td class="d-content" title="ctrl_conf">'+ctrl_conf+'</td>'+
                '<td class="d-content" title="htype">'+htype+'</td>'+
                '<td class="last">'+
                '<button type="button" class="btn-host" data-toggle="modal" data-target=".modal-host" title="update">更新</button>'+
                '| <button type="button" class="btn-delete" title="delete">删除</button>'+
            '</tr>';
    });
    html = '<table class="table table-striped jambo_table bulk_action">'+
                '<thead>'+
                  '<tr class="headings">'+
                    '<th>'+
                      '<input type="checkbox" id="check-all" class="flat">'+
                    '</th>'+
                    '<th class="column-title">IP地址</th>'+
                    '<th class="column-title">主机名</th>'+
                    '<th class="column-title">用户名</th>'+
                    '<th class="column-title">远程控制配置</th>'+
                    '<th class="column-title">类型</th>'+
                    '<th class="column-title no-link last"><span class="nobr">操作</span></th>'+
                    '<th class="bulk-actions" colspan="6">'+
                      '<a class="antoo" id="del_data" name="host" style="color:#fff; font-weight:500;cursor:pointer;">批量删除 ( <span class="action-cnt"> </span> ) <i class="fa fa-chevron-down"></i></a>'+
                    '</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>'+dom+'</tbody></table>';
    $('#node1').html(html);
}