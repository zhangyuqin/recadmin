$(function(){
    //更新时保存数据
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var server = new requestData();

    var url = '/api/v1/server/'    
    var type = 'get';
    server.ajaxData(url,type,null,function(data){ 
        renderDom(data);
    });
    //添加和更新
    $(document).on("click",".btn-server",function(){
        var domain_attr = $(this).attr("title"); 
        //添加和更新用这个title属性判断，将对应的dom放入modal中
        console.log(domain_attr);
        if(domain_attr == 'add'){
            // 添加名称  modal dom
            var server_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">解析服务器</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            
            var server_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名字</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name">'+
                        '</div></div>';
            var server_address =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="address">地址</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="address" required="required" class="form-control col-md-7 col-xs-12 ipVaild" name="address">'+
                        '</div></div>';  
            var server_addr =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="src_addr">源地址</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="src_addr" class="form-control col-md-7 col-xs-12 ipVaild" name="src_addr">'+
                        '</div></div>';             
            var server_order =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="order">优先级</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="number" id="order" required="required" class="form-control col-md-7 col-xs-12" name="order" title="">'+
                        '</div></div>'; 
            var server_weight =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="weight">权重</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="number" id="weight" required="required" class="form-control col-md-7 col-xs-12" name="weight" title="">'+
                        '</div></div>'; 
            var server_note =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="note">备注</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note" title="">'+
                        '</div></div>';             
            var server_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">状态</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+
                                '<input type="radio" class="switch-input" name="status" value="1" id="addone" checked>'+
                                '<label for="addone" class="switch-label switch-label-off">启用</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzero">'+
                                '<label for="addzero" class="switch-label switch-label-on">停用</label>'+
                                '<span class="switch-selection"></span>'+
                            '</div></div></div>';   
            var server_dtype = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="dtype">类型</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="dtype">'+
                                '<option value="dist_unbound">RIP</option>'+
                                '<option value="dnsdist">VIP</option>'+
                                '<option value="other">其他递归地址</option>'+
                            '</select></div></div>';                                          
            var server_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                        '</div></div></div></div>';
            var server_html = server_header+server_name+server_address+server_addr+server_order+server_weight+server_note+server_dtype+server_status+server_footer;  
            $('#modal-server').html(server_html);            
        }else if(domain_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            content.trdom = $(this).parent().parent();
            //获取 域名分组id
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
            //更新   modal dom
            var content_dtype=option_type(content.dtype);
            var server_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">解析服务器</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">'; 
            var server_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" title="" value = "'+content.name+'">'+
                        '</div>'+
                    '</div>'; 
            var server_address =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="address">地址</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="address" required="required" class="form-control col-md-7 col-xs-12 ipVaild" name="address" value="'+content.address+'" readonly>'+
                        '</div></div>'; 
            var server_addr =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="src_addr">源地址</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="src_addr" class="form-control col-md-7 col-xs-12 ipVaild" name="src_addr" value="'+content.src_addr+'" readonly>'+
                        '</div></div>';             
            var server_order =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="order">优先级</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="number" id="order" required="required" class="form-control col-md-7 col-xs-12" name="order" title="" value="'+content.order+'">'+
                        '</div></div>'; 
            var server_weight =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="weight">权重</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="number" id="weight" required="required" class="form-control col-md-7 col-xs-12" name="weight" title="" value="'+content.weight+'">'+
                        '</div></div>'; 
            var server_note =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="note">备注</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note" title="" value="'+content.note+'">'+
                        '</div></div>';  
            var server_dtype = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">类型</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="dtype">'+content_dtype+'</select></div></div>';                       
            if(content.status == '启用'){
                var status_input = '<input type="radio" class="switch-input" name="status" value="1" id="addoneu" checked>'+
                                '<label for="addoneu" class="switch-label switch-label-off">启用</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzerou">'+
                                '<label for="addzerou" class="switch-label switch-label-on">停用</label>'+
                                '<span class="switch-selection"></span>';
            }else{
                var status_input = '<input type="radio" class="switch-input" name="status" value="1" id="addoneu" >'+
                        '<label for="addoneu" class="switch-label switch-label-off">启用</label>'+
                        '<input type="radio" class="switch-input" name="status" value="0" id="addzerou" checked>'+
                        '<label for="addzerou" class="switch-label switch-label-on">停用</label>'+
                        '<span class="switch-selection"></span>';
            };                
            var server_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">状态</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+status_input+'</div></div></div>';                  
            var server_footer ='<div class="ln_solid"></div>'+
                            '<div class="form-group">'+
                                '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                    '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                                    '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                                '</div>'+
                            '</div>'+
                        '</div></div>';  
             var server_html = server_header+server_name+server_address+server_addr+server_order+server_weight+server_note+server_dtype+server_status+server_footer;
                
            $('#modal-server').html(server_html);                       
        }  
    }); 

     //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            name:null,
            address:null,
            src_addr:null,
            weight:null,
            order:null,
            note:null,
            dtype:null,
            status:null
        };
        datas.name = $('input[name="name"]').val();
        datas.address = $('input[name="address"]').val();
        datas.src_addr = $('input[name="src_addr"]').val();
        datas.weight = $('input[name="weight"]').val();
        datas.order = $('input[name="order"]').val();
        datas.note = $('input[name="note"]').val();
        datas.status = $('input[name="status"]:checked').val();
        datas.dtype = $('select[name="dtype"] option:selected').val();
        var dtypename = $('select[name="dtype"] option:selected').text();
        var type = 'post';
        server.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="name">'+data.name+'</td>'+
                '<td class="d-content" title="address">'+data.address+'</td>'+
                '<td class="d-content" title="src_addr">'+data.src_addr+'</td>'+
                '<td class="d-content" title="weight">'+data.weight+'</td>'+
                '<td class="d-content" title="order">'+data.order+'</td>'+
                '<td class="d-content" title="note">'+data.note+'</td>'+
                '<td class="d-content" title="dtype" style="display:none;">'+data.dtype+'</td>'+
                '<td class="d-content" title="dtypename">'+dtypename+'</td>'+
                '<td class="d-content" title="status">'+
                 (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
               '<button type="button" class="btn btn-server btn-info btn-xs" data-toggle="modal" data-target=".modal-server" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
            name:null,
            address:null,
            src_addr:null,
            weight:null,
            order:null,
            note:null,
            dtype:null,
            status:null
        };
        datas.name = $('input[name="name"]').val();
        datas.address = $('input[name="address"]').val();
        datas.src_addr = $('input[name="src_addr"]').val();
        datas.weight = $('input[name="weight"]').val();
        datas.order = $('input[name="order"]').val();
        datas.note = $('input[name="note"]').val();
        datas.status = $('input[name="status"]:checked').val();
        datas.dtype = $('select[name="dtype"] option:selected').val();
        var dtypename = $('select[name="dtype"] option:selected').text();
        var type = 'put';
        var url = '/api/v1/server/'+content.id+'/';
        server.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html ='<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="name">'+data.name+'</td>'+
                '<td class="d-content" title="address">'+data.address+'</td>'+
                '<td class="d-content" title="src_addr">'+data.src_addr+'</td>'+
                '<td class="d-content" title="weight">'+data.weight+'</td>'+
                '<td class="d-content" title="order">'+data.order+'</td>'+
                '<td class="d-content" title="note">'+data.note+'</td>'+
                '<td class="d-content" title="dtype" style="display:none;">'+data.dtype+'</td>'+
                '<td class="d-content" title="dtypename">'+dtypename+'</td>'+
                '<td class="d-content" title="status">'+
                 (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
               '<button type="button" class="btn btn-server btn-info btn-xs" data-toggle="modal" data-target=".modal-server" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
        var url ='/api/v1/server/'+dcontent.id+'/'
        server.ajaxData(url,type,dcontent,function(data){
            //window.location.reload();
            //删除tr元素
            $('.btn-delete').attr('disabled',false);
            trdom.remove();
        });
    });

});

function option_type(data){
    var arrayType = [
        {'en':'dist_unbound','ch':'RIP'},
        {'en':'dnsdist','ch':'VIP'},
        {'en':'other','ch':'其他递归地址'}];
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
            name = val.name,
            address = val.address,
            src_addr = val.src_addr,
            weight = val.weight,
            note = val.note,
            status = val.status,
            dtype = val.dtype,
            dtypename = '',
            order = val.order;
            switch(dtype){
                case 'dist_unbound':
                    dtypename = 'RIP';
                    break;
                case 'dnsdist':
                    dtypename ='VIP' ;
                    break;
                case 'other':
                    dtypename = '其他递归地址';
                    break;
            };
        dom+='<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+id+'</td>'+
                '<td class="d-content" title="name">'+name+'</td>'+
                '<td class="d-content" title="address">'+address+'</td>'+
                '<td class="d-content" title="src_addr">'+src_addr+'</td>'+
                '<td class="d-content" title="order">'+order+'</td>'+
                '<td class="d-content" title="weight">'+weight+'</td>'+
                '<td class="d-content" title="note">'+note+'</td>'+
                '<td class="d-content" title="dtype" style="display:none;">'+dtype+'</td>'+
                '<td class="d-content" title="dtypename">'+dtypename+'</td>'+
                '<td class="d-content" title="status">'+
                (status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-server btn-info btn-xs" data-toggle="modal" data-target=".modal-server" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
    });
   /* html = '<table class="table table-striped jambo_table bulk_action">'+
                '<thead>'+
                  '<tr class="headings">'+
                    '<th>'+
                      '<input type="checkbox" id="check-all" class="flat">'+
                    '</th>'+
                    '<th class="column-title">名称</th>'+
                    '<th class="column-title">地址</th>'+
                    '<th class="column-title">源地址</th>'+
                    '<th class="column-title">优先级</th>'+
                    '<th class="column-title">权重</th>'+
                    '<th class="column-title">备注</th>'+
                    '<th class="column-title no-link last"><span class="nobr">状态</span></th>'+
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