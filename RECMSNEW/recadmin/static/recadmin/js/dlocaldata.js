$(function(){

    //更新时保存数据
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var local_data = new requestData();

    var url = '/api/v1/local_data/'    
    var type = 'get';
    local_data.ajaxData(url,type,null,function(data){ 
        window.pooldata = data.Pool;
        renderDom(data.LocalData);
    });


    $(document).on('click','.btn-dlocaldata',function(){
        var forward_attr = $(this).attr('title');
        var pooloption  = renderPool(window.pooldata,null);
        if(forward_attr == 'add'){
            var forward_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">本地数据</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
                
            var forward_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">本地域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12 domainVaild" name="domain">'+
                        '</div></div>';
            var forward_IP = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="address">IP地址</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="address" required="required" class="form-control col-md-7 col-xs-12 ipVaild" name="address">'+
                        '</div></div>';
          
            var forward_type ='<div class="form-group">'+ 
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="rr">资源类型</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12" id="rr">'+
                            '<select class="form-control" name="rr" id="iptype">'+
                                '<option value="A">A</option>'+
                                '<option value="AAAA">AAAA</option>'+
                            '</select>'+    
                        '</div></div>';
            var forward_pool = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                            '</select></div></div>';             
            var forward_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                            '</div></div></div></div>';

            var forward_html = forward_header+forward_name+forward_type+forward_IP+forward_pool+forward_footer;
            $('#modal-dlocaldata').html(forward_html);             
        }else if(forward_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            content.trdom = $(this).parent().parent();
            var arrayType = ['A','AAAA'];
            //遍历资源类型
            var typehtml = '';
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                var val = $(val).text();
                content[title] = val;
            });
            var pooloption  = renderPool(window.pooldata,content.pool);
            var forward_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">本地域数据</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            var forward_name = '<div class="form-group">'+
                       '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">本地域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12" name="domain" value="'+content.domain+'" readonly>'+
                        '</div>'+
                    '</div>';
            var forward_IP = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="address">IP地址</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" required="required" class="form-control col-md-7 col-xs-12" name="address" id="address" value="'+content.address+'" readonly>'+
                        '</div></div>';
            var forward_pool = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                            '</select></div></div>';
            //判断content.rr 类型
            for(var i = 0; i<arrayType.length;i++){
                if(arrayType[i] == content.rr){
                    typehtml+= '<option value="'+content.rr+'" selected>'+content.rr+'</option>';
                }else{
                    typehtml+= '<option value="'+arrayType[i]+'">'+arrayType[i]+'</option>';
                } 
            };
            var forward_type = '<div class="form-group">'+ 
                                '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="rr">资源类型</label>'+
                                '<div class="col-md-6 col-sm-6 col-xs-12" id="rr">'+
                                    '<select class="form-control" name="rr" id="iptype">'+typehtml+'</select>'+    
                                '</div></div>';
            var forward_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                            '</div></div></div></div>';

            var forward_html = forward_header+forward_name+forward_type+forward_IP+forward_pool+forward_footer;
            $('#modal-dlocaldata').html(forward_html); 
        }else if(forward_attr == 'upload'){

            var forward_header = '<div class="modal-header">'+
                                 '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                                 '<h4 class="modal-title" id="myModalLabel">批量导入</h4></div>'+
                                 '<div class="modal-body">'+
                                 '<form  class="form-horizontal" action="impt" method="POST" enctype="multipart/form-data" onsubmit="return resubmit()">';

            var forward_csv = '<div class="form-group">'+
                              '<label for="dforward" class="col-sm-2 control-label">请选择.csv格式</label>'+
                              '<div class="col-md-8 col-sm-8 col-xs-12">'+
                                    '<input type="file" name="dlocaldata" accept=".csv" id="dlocaldata">'+
                              '</div></div>';
            var forward_img = '<div class="form-group">'+
                              '<label for="dforward" class="col-sm-2 control-label">示例</label>'+
                              '<div class="col-md-8 col-sm-8 col-xs-12">'+
                                    '<img src="/static/recadmin/image/dlocaldata.png" title="示例">'+
                              '</div></div>';                  
            var forward_footer = '<div class="ln_solid"></div>'+
                                  '<div class="form-group">'+
                                    '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                        '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                                        '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                        '<button type="submit" class="btn btn-success">确定</button>'+
                                    '</div></div></form></div>';
            var forward_html = forward_header+forward_csv+forward_img+forward_footer;
            $('#modal-dlocaldata').html(forward_html);                        
        }

    });
    //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            domain:null,
            rr:null,
            pool:null,
            address:null
        };
        datas.domain = $('input[name="domain"]').val();
        datas.rr = $('select[name="rr"] option:selected').val();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.address = $('input[name="address"]').val();
        var type = 'post';
        local_data.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="domain">'+data.domain+'</td>'+
                '<td class="d-content" title="rr">'+data.rr+'</td>'+
                '<td class="d-content" title="address">'+data.address+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="last">'+
                 '<button type="button" class="btn btn-dlocaldata btn-info btn-xs" data-toggle="modal" data-target=".modal-dlocaldata" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
            rr:null,
            pool:null,
            address:null
        };
        datas.domain = $('input[name="domain"]').val();
        datas.rr = $('select[name="rr"] option:selected').val();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.address = $('input[name="address"]').val();
        var type = 'put';
        var url = '/api/v1/local_data/'+content.id+'/';
        local_data.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html ='<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="domain">'+data.domain+'</td>'+
                '<td class="d-content" title="rr">'+data.rr+'</td>'+
                '<td class="d-content" title="address">'+data.address+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="last">'+
                 '<button type="button" class="btn btn-dlocaldata btn-info btn-xs" data-toggle="modal" data-target=".modal-dlocaldata" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
        var url ='/api/v1/local_data/'+dcontent.id+'/'
        local_data.ajaxData(url,type,dcontent,function(data){
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
            rr = val.rr,
            pool = val.pool.id,
            poolname = val.pool.name,
            address = val.address;
        dom+='<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+id+'</td>'+
                '<td class="d-content" title="domain">'+domain+'</td>'+
                '<td class="d-content" title="rr">'+rr+'</td>'+
                '<td class="d-content" title="address">'+address+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-dlocaldata btn-info btn-xs" data-toggle="modal" data-target=".modal-dlocaldata" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
    });
    /*html = '<table class="table table-striped jambo_table bulk_action">'+
                '<thead>'+
                  '<tr class="headings">'+
                    '<th>'+
                      '<input type="checkbox" id="check-all" class="flat">'+
                    '</th>'+
                    '<th class="column-title">本地域名</th>'+
                    '<th class="column-title">资源类型</th>'+
                    '<th class="column-title">IP地址</th>'+
                    '<th class="column-title">链路</th>'+
                    '<th class="column-title no-link last"><span class="nobr">操作</span></th>'+
                    '<th class="bulk-actions" colspan="3">'+
                      '<a class="antoo" id="del_data" name="dforward" style="color:#fff; font-weight:500;cursor:pointer;">批量删除 ( <span class="action-cnt"> </span> ) <i class="fa fa-chevron-down"></i></a>'+
                    '</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>'+dom+'</tbody></table>';*/
    $('#node1').html(dom);
    create_icheck();
}