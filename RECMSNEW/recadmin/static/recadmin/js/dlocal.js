$(function(){
    //rtype name val

    /*var arrayRtype = [
        {name:'本地',val:'static'},
        {name:'透明',val:'typetransparent'},
        {name:'拒绝',val:'refuse'},
        {name:'丢弃',val:'drop'},
        {name:'重定向',val:'redirect'}
    ];*/
    //更新时保存数据
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var dlocal_zone = new requestData();

    var url = '/api/v1/local_zone/'    
    var type = 'get';
    dlocal_zone.ajaxData(url,type,null,function(data){ 
        window.pooldata = data.Pool;
        renderDom(data.LocalZone);
    });


    //打开模态框，加载html
    $(document).on('click','.btn-dlocal',function(){
        var dlocal_attr = $(this).attr('title');
        if(dlocal_attr == 'add'){
            var pooloption  = renderPool(window.pooldata,null);
            var dlocal_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">私有域名</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
                
            var dlocal_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="zone">本地域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="zone" required="required" class="form-control col-md-7 col-xs-12 domainVaild" name="zone">'+
                        '</div></div>';
            var dlocal_type = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">类型</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="rtype">'+
                                '<option value="drop">丢弃</option>'+
                                '<option value="refuse">拒绝</option>'+
                                '<option value="static">仅本地</option>'+
                                '<option value="typetransparent">传统</option>'+
                                '<option value="redirect">重定向</option>'+
                            '</select></div></div>';
            var dlocal_pool = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                            '</select></div></div>';                 
            var dlocal_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">是否启用</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+
                                '<input type="radio" class="switch-input" name="status" value="1" id="addone" checked>'+
                                '<label for="addone" class="switch-label switch-label-off">开启</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzero">'+
                                '<label for="addzero" class="switch-label switch-label-on">关闭</label>'+
                                '<span class="switch-selection"></span>'+
                            '</div></div></div>';

            var dlocal_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                            '</div></div></div></div>';

            var dlocal_html = dlocal_header+dlocal_name+dlocal_type+dlocal_pool+dlocal_status+dlocal_footer;
            $('#modal-dlocal').html(dlocal_html);             
        }else if(dlocal_attr == 'update'){
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
            var dlocal_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">私有域名</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            var dlocal_name = '<div class="form-group">'+
                       '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="zone">本地域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="zone" required="required" class="form-control col-md-7 col-xs-12" name="zone" title="localzone" value="'+content.zone+'" readonly>'+
                        '</div>'+
                    '</div>';
            //获取选择类型 content.rtype
            var content_rtype=option_type(content.rtype);
            var dlocal_type = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">类型</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="rtype">'+content_rtype+'</select></div></div>';
            var dlocal_pool = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                            '</select></div></div>';                 
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

            var dlocal_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">是否启用</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+status_input+'</div>'+
                        '</div></div>';

            var dlocal_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                            '</div></div></div></div>';

            var dlocal_html = dlocal_header+dlocal_name+dlocal_type+dlocal_pool+dlocal_status+dlocal_footer;
            $('#modal-dlocal').html(dlocal_html); 
        }else if(dlocal_attr == 'upload'){
            var dlocal_header = '<div class="modal-header">'+
                                 '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                                 '<h4 class="modal-title" id="myModalLabel">批量导入</h4></div>'+
                                 '<div class="modal-body">'+
                                 '<form  class="form-horizontal" action="impt" method="POST" enctype="multipart/form-data" onsubmit="return resubmit()">';

            var dlocal_csv = '<div class="form-group">'+
                              '<label for="dlocal" class="col-sm-2 control-label">请选择.csv格式</label>'+
                              '<div class="col-md-8 col-sm-8 col-xs-12">'+
                                    '<input type="file" name="dlocal" accept=".csv">'+
                              '</div></div>';
            var dlocal_img = '<div class="form-group">'+
                              '<label for="dlocal" class="col-sm-2 control-label">示例</label>'+
                              '<div class="col-md-8 col-sm-8 col-xs-12">'+
                                    '<img src="/static/recadmin/image/dlocal.png" title="示例">'+
                              '</div></div>';                  
            var dlocal_footer = '<div class="ln_solid"></div>'+
                                  '<div class="form-group">'+
                                    '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                        '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                        '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                                    '</div></div></form></div>';
            var dlocal_html = dlocal_header+dlocal_csv+dlocal_img+dlocal_footer;
            console.log(dlocal_html);
            $('#modal-dlocal').html(dlocal_html);                        
        }

    });

     //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            zone:null,
            rtype:null,
            pool:null,
            status:null
        };
        datas.zone = $('input[name="zone"]').val();
        datas.rtype = $('select[name="rtype"] option:selected').val();
        var rtypename = $('select[name="rtype"] option:selected').text();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.status = $('input[name="status"]:checked').val();
        var type = 'post';
        dlocal_zone.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="zone">'+data.zone+'</td>'+
                '<td class="d-content" title="rtype" style="display:none;">'+data.rtype+'</td>'+
                '<td class="d-content" title="rtypename">'+rtypename+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="status">'+
                (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-dlocal btn-info btn-xs" data-toggle="modal" data-target=".modal-dlocal" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
            zone:null,
            rtype:null,
            pool:null,
            status:null
        };
        datas.zone = $('input[name="zone"]').val();
        datas.rtype = $('select[name="rtype"] option:selected').val();
        var rtypename = $('select[name="rtype"] option:selected').text();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.status = $('input[name="status"]:checked').val();
        var type = 'put';
        var url = '/api/v1/local_zone/'+content.id+'/';
        dlocal_zone.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html ='<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="zone">'+data.zone+'</td>'+
                '<td class="d-content" title="rtype">'+data.rtype+'</td>'+
                '<td class="d-content" title="rtypename">'+rtypename+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="status">'+
                (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                 '<button type="button" class="btn btn-dlocal btn-info btn-xs" data-toggle="modal" data-target=".modal-dlocal" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>';
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
        var url ='/api/v1/local_zone/'+dcontent.id+'/'
        dlocal_zone.ajaxData(url,type,dcontent,function(data){
            //window.location.reload();
            //删除tr元素
            $('.btn-delete').attr('disabled',false);
            trdom.remove();
        });
    });

}); 

function option_type(data){
    var arrayType = [
        {'en':'drop','ch':'丢弃'},
        {'en':'refuse','ch':'拒绝'},
        {'en':'static','ch':'仅本地'},
        {'en':'typetransparent','ch':'传统'},
        {'en':'redirect','ch':'重定向'}];
    var htmltype = '';
    for(var i=0;i<arrayType.length;i++){
        if(arrayType[i].en==data){
            htmltype+='<option value="'+arrayType[i].en+'" selected>'+arrayType[i].ch+'</option>';
        }else{
            htmltype+='<option value="'+arrayType[i].en+'">'+arrayType[i].ch+'</option>';
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
            zone = val.zone,
            rtype = val.rtype,
            rtypename = '',
            pool = val.pool.id,
            poolname = val.pool.name,
            status = val.status;
            switch(rtype){
                case 'drop':
                    rtypename = '丢弃';
                    break;
                case 'refuse':
                    rtypename ='拒绝' ;
                    break;
                case 'static':
                    rtypename = '仅本地';
                    break;
                case 'typetransparent':
                    rtypename = '传统';
                    break;
                case 'redirect':
                    rtypename = '重定向';
                    break;               
            };
        dom+='<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+id+'</td>'+
                '<td class="d-content" title="zone">'+zone+'</td>'+
                '<td class="d-content" title="rtype" style="display:none;">'+rtype+'</td>'+
                '<td class="d-content" title="rtypename">'+rtypename+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="status">'+
                (status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-dlocal btn-info btn-xs" data-toggle="modal" data-target=".modal-dlocal" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
    });
   /* html = '<table class="table table-striped jambo_table bulk_action">'+
                '<thead>'+
                  '<tr class="headings">'+
                    '<th>'+
                      '<input type="checkbox" id="check-all" class="flat">'+
                    '</th>'+
                    '<th class="column-title">本地域名</th>'+
                    '<th class="column-title">响应类型</th>'+
                    '<th class="column-title">链路</th>'+
                    '<th class="column-title no-link last"><span class="nobr">是否启用</span></th>'+
                    '<th class="column-title no-link last"><span class="nobr">操作</span></th>'+
                    '<th class="bulk-actions" colspan="4">'+
                      '<a class="antoo" id="del_data" name="dforward" style="color:#fff; font-weight:500;cursor:pointer;">批量删除 ( <span class="action-cnt"> </span> ) <i class="fa fa-chevron-down"></i></a>'+
                    '</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>'+dom+'</tbody></table>';*/
    $('#node1').html(dom);
    create_icheck();
}