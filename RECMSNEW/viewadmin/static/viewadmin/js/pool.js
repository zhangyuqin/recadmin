$(function(){

    //更新时保存数据
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var pool = new requestData();
    var url = '/api/v1/pool/'    
    var type = 'get';
    pool.ajaxData(url,type,null,function(data){ 
        window.policydata = data.Policy;
        window.cachedata = data.Cache;
        window.serverdata = data.Servers
        renderDom(data.Pool);
        
    });
    $(document).on("click",".btn-pool",function(){
        var domain_attr = $(this).attr("title"); 
        var serverdata = renderPool(window.serverdata,null);
        var policydata  = renderPool(window.policydata,null);
        var cachedata  = renderPool(window.cachedata,null);
        //添加和更新用这个title属性判断，将对应的dom放入modal中
        if(domain_attr == 'add'){
            // 添加名称  modal dom
            var pool_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">运营商</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            
            var pool_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name">'+
                        '</div></div>';
            var pool_servers ='<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">DNS服务器</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="servers" id="servers" multiple="multiple">'+
                                serverdata+
                            '</select>'+ 
                        '</div></div>';
            var pool_policy = '<div class="form-group">'+
                            '<label class="control-label col-md-3 col-sm-3 col-xs-12">负载均衡策略</label>'+
                            '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                '<select class="form-control" name="policy" id="policy">'+
                                policydata+
                                '</select>'+    
                            '</div>'+
                        '</div>';                           
            var pool_cache ='<div class="form-group">'+
                            '<label class="control-label col-md-3 col-sm-3 col-xs-12">缓存</label>'+
                            '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                '<select class="form-control" name="cache" id="cache">'+
                                    cachedata+
                                '</select>'+ 
                            '</div>'+
                        '</div>';               
            var pool_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                        '</div></div></div></div>';
            var pool_html = pool_header+pool_name+pool_servers+pool_policy+pool_cache+pool_footer;
                
            $('#modal-pool').html(pool_html);            
        }else if(domain_attr == 'update'){              
            var dom = $(this).parent().siblings('.d-content');
            content.trdom = $(this).parent().parent();
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                var that = $(val).children();
                if(that.length != 0){
                    var val = [];
                    var pdom = that;
                    console.log(pdom);
                    for(var i=0;i<pdom.length;i++){
                        var pserver = {id:null,name:null};
                        pserver.id = parseInt($(pdom[i]).attr('id'));
                        pserver.name = $(pdom[i]).text();
                        val.push(pserver);
                    }
                }else{
                    var val = $(val).text();
                }  
                content[title] = val;
            });
            console.log(content);
            //获取选中状态
            var policydata  = renderPool(window.policydata,content.policy);
            var cachedata  = renderPool(window.cachedata,content.cache);
            var serverdata = renderServer(window.serverdata,content.servers);
            //更新   modal dom
            var pool_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">运营商</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            
            var pool_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" value="'+content.name+'">'+
                        '</div></div>';
            var pool_servers ='<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">DNS服务器</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                             '<select class="form-control" name="servers" id="servers" multiple="multiple">'+
                             serverdata+
                             '</select>'+
                        '</div></div>';                 
            var pool_policy = '<div class="form-group">'+
                            '<label class="control-label col-md-3 col-sm-3 col-xs-12">负载均衡策略</label>'+
                            '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                '<select class="form-control" name="policy" id="policy">'+
                                    policydata+
                                '</select>'+ 
                            '</div>'+
                        '</div>';                           
            var pool_cache ='<div class="form-group">'+
                            '<label class="control-label col-md-3 col-sm-3 col-xs-12">缓存</label>'+
                            '<div class="col-md-6 col-sm-6 col-xs-12">'+
                                '<select class="form-control" name="cache" id="cache">'+
                                    cachedata+
                                '</select>'+ 
                            '</div>'+
                        '</div>';               
            var pool_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                        '</div></div></form></div>';
            var pool_html = pool_header+pool_name+pool_servers+pool_policy+pool_cache+pool_footer;
                
            $('#modal-pool').html(pool_html);                      
        }  
    }); 
    //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            name:null,
            servers:[],
            policy:null,
            cache:null
        };
        datas.name = $('input[name="name"]').val();
        $('select[name="servers"] option:selected').each(function(){
            datas.servers.push(parseInt($(this).val()));
        });
        datas.policy = $('select[name="policy"] option:selected').val();
        datas.cache = $('select[name="cache"] option:selected').val();
        // console.log(datas.servers);
        var type = 'post';
        console.log(datas);
        pool.ajaxData(url,type,datas,function(data){
            window.location.reload();
            /*$('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var serversname = '';
            for(var i = 0; i<data.servers.length;i++){
                serversname+= '<p id="'+data.servers[i].id+'">'+data.servers[i].name+'</p>';
            }
            var html = '<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="name">'+data.name+'</td>'+
                '<td class="d-content" title="servers">'+serversname+'</td>'+
                '<td class="d-content" title="policy" style="display:none;">'+data.policy.id+'</td>'+
                '<td class="d-content" title="policyname">'+data.policy.name+'</td>'+
                '<td class="d-content" title="cachename">'+data.cache.name+'</td>'+
                '<td class="d-content" title="cache" style="display:none;">'+data.cache.id+'</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-pool btn-info btn-xs" data-toggle="modal" data-target=".modal-pool" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
            $('.table tbody').append(html);*/
        });
    });

    //更新
    $(document).on('click','.btn-update',function(){
        $('.btn-add').attr('disabled',true);
        var datas = {
            name:null,
            servers:[],
            policy:null,
            cache:null
        };
        datas.name = $('input[name="name"]').val();
        $('select[name="servers"] option:selected').each(function(){
            datas.servers.push(parseInt($(this).val()));
        });
        datas.policy = $('select[name="policy"] option:selected').val();
        datas.cache = $('select[name="cache"] option:selected').val();

        var type = 'put';
        var url = '/api/v1/pool/'+content.id+'/';
        pool.ajaxData(url,type,datas,function(data){
            window.location.reload();
            /*$('.btn-add').attr('disabled',false);
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
            create_icheck();  */
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
        var url ='/api/v1/pool/'+dcontent.id+'/'
        pool.ajaxData(url,type,dcontent,function(data){
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
            name = val.name,
            policy = val.policy,
            serversname = '',
            cache = val.cache; 
            for(var i = 0; i<val.servers.length;i++){
                serversname+= '<p id="'+val.servers[i].id+'">'+val.servers[i].name+'</p>';
            }
        dom+='<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+id+'</td>'+
                '<td class="d-content" title="name">'+name+'</td>'+
                '<td class="d-content" title="servers">'+serversname+'</td>'+
                '<td class="d-content" title="policy" attr="'+policy.id+'">'+policy.name+'</td>'+
                '<td class="d-content" title="cache" attr="'+cache.id+'">'+cache.name+'</td>'+
                '<td class="last">'+
                 '<button type="button" class="btn btn-pool btn-info btn-xs" data-toggle="modal" data-target=".modal-pool" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
    });
    /*html = '<table class="table table-striped jambo_table bulk_action">'+
                '<thead>'+
                  '<tr class="headings">'+
                    '<th>'+
                      '<input type="checkbox" id="check-all" class="flat">'+
                    '</th>'+
                    '<th class="column-title">名称</th>'+
                    '<th class="column-title">服务器</th>'+
                    '<th class="column-title">策略</th>'+
                    '<th class="column-title">缓存</th>'+
                    '<th class="column-title no-link last"><span class="nobr">操作</span></th>'+
                    '<th class="bulk-actions" colspan="5">'+
                      '<a class="antoo" id="del_data" name="pool" style="color:#fff; font-weight:500;cursor:pointer;">批量删除 ( <span class="action-cnt"> </span> ) <i class="fa fa-chevron-down"></i></a>'+
                    '</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>'+dom+'</tbody></table>';*/
    $('#node1').html(dom);
    create_icheck();
}      


