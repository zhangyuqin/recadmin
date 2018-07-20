$(function(){
    
    //更新时保存数据
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var dforward_data = new requestData();
    var url = '/api/v1/forward_domain/'    
    var type = 'get';
    dforward_data.ajaxData(url,type,null,function(data){ 
        window.pooldata = data.Pool;
        //renderDom(data.FowarDomain);
        //分页
        var element = $('#bootpagin');
        var total = data.FowarDomain.length;
        var data  = data.FowarDomain;
        var numberOfPages = 10;
        var arr = [];
        var options = {
            bootstrapMajorVersion:3,
            currentPage: 1,
            numberOfPages: numberOfPages,
            totalPages:Math.ceil(total/numberOfPages),
            onPageClicked:function(event,originalEvent,type,page){
                var arr = [];
                if(page*numberOfPages>total){
                    for(var i=(page-1)*numberOfPages;i<total;i++){
                        arr.push(data[i]);
                    }
                }else{
                    for(var i=(page-1)*numberOfPages;i<page*numberOfPages;i++){
                        arr.push(data[i]);
                    }
                }
                renderDom(arr);
            }
        }
        if(total<numberOfPages){
            console.log(data);
            renderDom(data);
        }else{
            for(var i=0;i<numberOfPages;i++){
               arr.push(data[i]);
               console.log(arr);
            }
            renderDom(arr); 
        }
        element.bootstrapPaginator(options);
        
    });

    $(document).on('click','.btn-forward',function(){
        var forward_attr = $(this).attr('title');
        var pooloption  = renderPool(window.pooldata,null);
        if(forward_attr == 'add'){
            var forward_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">转发域名</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
                
            var forward_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="domain">域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12 domainVaild" name="domain">'+
                        '</div></div>';
            var forward_server = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">转发服务器</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="server" required="required" class="form-control col-md-7 col-xs-12 ipVaild" name="server">'+
                        '</div></div>';
            var forward_pool = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                            '</select></div></div>';            
            var forward_only = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">仅转发</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+
                                '<input type="radio" class="switch-input" name="only" value="1" id="addonlyone" checked>'+
                                '<label for="addonlyone" class="switch-label switch-label-off">转发</label>'+
                                '<input type="radio" class="switch-input" name="only" value="0" id="addonlyzero">'+
                                '<label for="addonlyzero" class="switch-label switch-label-on">关闭</label>'+
                                '<span class="switch-selection"></span>'+
                            '</div></div></div>';
            var forward_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">状态</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+
                                '<input type="radio" class="switch-input" name="status" value="1" id="addone" checked>'+
                                '<label for="addone" class="switch-label switch-label-off">启用</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzero">'+
                                '<label for="addzero" class="switch-label switch-label-on">停用</label>'+
                                '<span class="switch-selection"></span>'+
                            '</div></div></div>';

            var forward_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                            '</div></div></div></div>';

            var forward_html = forward_header+forward_name+forward_server+forward_pool+forward_only+forward_status+forward_footer;
            $('#modal-forward').html(forward_html);             
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
            console.log(content);
            var pooloption  = renderPool(window.pooldata,content.pool);
            var forward_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">转发域名</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            var forward_name = '<div class="form-group">'+
                       '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="domain" value="'+content.domain+'" readonly>'+
                        '</div>'+
                    '</div>';
            var forward_server = '<div class="form-group">'+
                                '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">转发服务器</label>'+
                                '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                    '<input type="text" id="type" required="required" class="form-control col-md-7 col-xs-12" name="server" value="'+content.server+'" readonly>'+
                                '</div>'+
                               '</div>';
            var forward_pool = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                            '</select></div></div>';                   
            //判断content.only
            if(content.only == '是'){
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

            var forward_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">状态</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+status_input+'</div>'+
                        '</div></div>';

            var forward_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                            '</div></div></div></div>';

            var forward_html = forward_header+forward_name+forward_server+forward_pool+forward_only+forward_status+forward_footer;
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
                                        '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                        '<button type="submit" class="btn btn-success">确定</button>'+
                                    '</div></div></form></div>';
            var forward_html = forward_header+forward_csv+forward_img+forward_footer;
            $('#modal-forward').html(forward_html);                        
        }

    });
    //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-add').attr('disabled',true);
        var datas = {
            domain:null,
            server:null,
            pool:null,
            only:null,
            status:null
        };
        datas.domain = $('input[name="domain"]').val();
        datas.server = $('input[name="server"]').val();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.only = $('input[name="only"]:checked').val();
        datas.status = $('input[name="status"]:checked').val();        
        var type = 'post';
        dforward_data.ajaxData(url,type,datas,function(data){
            // window.location.reload();
            console.log(data);
            $('.btn-add').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="domain">'+data.domain+'</td>'+
                '<td class="d-content" title="server">'+data.server+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="only">'+
                (data.only == 1 ? '<span class="btn btn-success btn-xs">是</span>':'<span class="btn btn-danger btn-xs">否</span>')+
                '</td>'+
                '<td class="d-content" title="status">'+
                (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
               '<button type="button" class="btn btn-forward btn-info btn-xs" data-toggle="modal" data-target=".modal-dforward" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
            $('.table tbody').append(html);
            create_icheck();
        });
    });

    //更新
    $(document).on('click','.btn-update',function(){
        $('.btn-add').attr('disabled',true);
        var datas = {
            domain:null,
            server:null,
            pool:null,
            only:null,
            status:null
        };
        datas.domain = $('input[name="domain"]').val();
        datas.server = $('input[name="server"]').val();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.only = $('input[name="only"]:checked').val();
        datas.status = $('input[name="status"]:checked').val();

        var type = 'put';
        var url = '/api/v1/forward_domain/'+content.id+'/';
        console.log(datas);
        dforward_data.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-add').attr('disabled',false);
            $('.modal').modal('hide');
            var html ='<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="domain">'+data.domain+'</td>'+
                '<td class="d-content" title="server">'+data.server+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="only">'+
                (data.only == 1 ? '<span class="btn btn-success btn-xs">是</span>':'<span class="btn btn-danger btn-xs">否</span>')+
                '</td>'+
                '<td class="d-content" title="status">'+
                (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-forward btn-info btn-xs" data-toggle="modal" data-target=".modal-dforward" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
        var url ='/api/v1/forward_domain/'+dcontent.id+'/'
        dforward_data.ajaxData(url,type,dcontent,function(data){
            //window.location.reload();
            //删除tr元素
            $('.btn-delete').attr('disabled',false);
            trdom.remove();
        });
    });

    //搜索
    $('.btn-search').on('click',function(){
        $('.btn-search').attr('disabled',true);
        var val = $('#search').val();
        var url = '/api/v1/forward_domain/?search='+val;
        console.log(url);
        dforward_data.ajaxData(url,type,null,function(data){
            console.log(data);
            $('.btn-search').attr('disabled',false);
            if(data.FowarDomain.length == 0){
                alert('暂无数据');
            }else{
               renderDom(data.FowarDomain); 
            }
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
            server = val.server,
            pool = val.pool.id?val.pool.id:null,
            poolname = val.pool.name?val.pool.name:'default',
            only = val.only,
            status = val.status;
        dom+='<tr class="even pointer">'+
                '<td class="a-center">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+id+'</td>'+
                '<td class="d-content" title="domain">'+domain+'</td>'+
                '<td class="d-content" title="server">'+server+'</td>'+
                '<td class="d-content" title="pool" style="display:none;">'+pool+'</td>'+
                '<td class="d-content" title="poolname">'+poolname+'</td>'+
                '<td class="d-content" title="only">'+
                (only == 1 ? '<span class="btn btn-success btn-xs">是</span>':'<span class="btn btn-danger btn-xs">否</span>')+
                '</td>'+
                '<td class="d-content" title="status">'+
                (status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                '</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-forward btn-info btn-xs" data-toggle="modal" data-target=".modal-dforward" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
    });
    /*html = '<table class="table table-striped jambo_table bulk_action">'+
                '<thead>'+
                  '<tr class="headings">'+
                    '<th>'+
                      '<input type="checkbox" id="check-all" class="flat">'+
                    '</th>'+
                    '<th class="column-title">转发域名</th>'+
                    '<th class="column-title">NS</th>'+
                    '<th class="column-title">链路</th>'+
                    '<th class="column-title no-link last"><span class="nobr">仅转发</span></th>'+
                    '<th class="column-title no-link last"><span class="nobr">是否启用</span></th>'+
                    '<th class="column-title no-link last"><span class="nobr">操作</span></th>'+
                    '<th class="bulk-actions" colspan="5">'+
                      '<a class="antoo" id="del_data" name="dforward" style="color:#fff; font-weight:500;cursor:pointer;">批量删除 ( <span class="action-cnt"> </span> ) <i class="fa fa-chevron-down"></i></a>'+
                    '</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>'+dom+'</tbody></table>';*/
    $('#node1').html(dom);
    create_icheck();
}


