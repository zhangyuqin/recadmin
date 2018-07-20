$(function(){

    var content = {
        trdom :null
    };
    //ajax 获取数据
    var cache_config = new requestData();

    var url = '/api/v1/cache_config/'    
    var type = 'get';
    cache_config.ajaxData(url,type,null,function(data){ 
        renderDom(data);
    });

    //添加和更新
    $(document).on("click",".btn-cacheconfig",function(){
        var domain_attr = $(this).attr("title"); 
        if(domain_attr == 'add'){
            // 添加名称  modal dom
            var cache_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">缓存配置</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            var cache_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12 nameVaild" name="name">'+
                        '</div></div>';
            var cache_conf =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="conf">缓存配置</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="conf">'+
                                '<option value="50000000">大(用户数量10w-50w)</option>'+
                                '<option value="5000000" selected>中(用户数量1w-10w)</option>'+
                                '<option value="2000000">小(用户数量1w以下)</option>'+
                            '</select></div></div>';
            var cache_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                        '</div></div></div></div>';
            var cache_html = cache_header+cache_name+cache_conf+cache_footer;
                
            $('#modal-cacheconfig').html(cache_html);            
        }else if(domain_attr == 'update'){
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

            var arrayType = [
                {'en':50000000,'ch':'大(用户数量10w-50w)'},
                {'en':5000000,'ch':'中(用户数量1w-10w)'},
                {'en':2000000,'ch':'小(用户数量1w以下'}
            ];
            var confname=option_type(arrayType,content.entries);
            //更新   modal dom
            var cache_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">缓存配置</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';;
            var cache_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12 nameVaild" name="name" value = "'+content.name+'">'+
                        '</div></div>';
            var cache_conf =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="entries">缓存配置</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="conf">'+
                                confname+
                            '</select></div></div>';                       
            var cache_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                        '</div></div></div></div>';
            var cache_html = cache_header+cache_name+cache_conf+cache_footer;
                
            $('#modal-cacheconfig').html(cache_html);                      
        }  
    }); 

      //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            name:null,
            entries:null,
            minTTL:0,
            maxTTL:86400,
            servfail:60,
            stale:120,
            keepTTL:1
        };
        datas.name = $('input[name="name"]').val();
        datas.entries= $('select[name="conf"] option:selected').val();
        var confname = $('select[name="conf"] option:selected').text();
        var type = 'post';
        cache_config.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="name">'+data.name+'</td>'+
                '<td class="d-content" title="entries" style="display:none">'+data.entries+'</td>'+
                '<td class="d-content" title="confname">'+confname+'</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-cacheconfig btn-info btn-xs" data-toggle="modal" data-target=".modal-cacheconfig" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
            entries:null,
            minTTL:0,
            maxTTL:86400,
            servfail:60,
            stale:120,
            keepTTL:1
        };
        datas.name = $('input[name="name"]').val();
        datas.entries= $('select[name="conf"] option:selected').val();
        var confname = $('select[name="conf"] option:selected').text();
        var type = 'put';
        var url = '/api/v1/cache_config/'+content.id+'/';
        cache_config.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = 
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+data.id+'</td>'+
                '<td class="d-content" title="name">'+data.name+'</td>'+
                '<td class="d-content" title="entries" style="display:none">'+data.entries+'</td>'+
                '<td class="d-content" title="confname">'+confname+'</td>'+
                '<td class="last">'+
                '<button type="button" class="btn btn-cacheconfig btn-info btn-xs" data-toggle="modal" data-target=".modal-cacheconfig" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
        var url ='/api/v1/cache_config/'+dcontent.id+'/'
        cache_config.ajaxData(url,type,dcontent,function(data){
            //window.location.reload();
            //删除tr元素
            $('.btn-delete').attr('disabled',false);
            trdom.remove();
        });
    });
});      

function option_type(arrayType,data){
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
            confname = '',
            entries = val.entries;
            switch(entries){
                case 50000000:
                    confname = '大(用户数量：10W-50W)';
                    break;
                case 5000000:
                    confname = '中(用户数量：1W-10W)';
                    break;
                case 2000000:
                    confname = '小(用户数量1W以下)';
                    break;          
            }
        dom+='<tr class="even pointer">'+
                '<td class="a-center ">'+
                    '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                '</td>'+
                '<td class="d-content" title="id">'+id+'</td>'+
                '<td class="d-content" title="name">'+name+'</td>'+
                '<td class="d-content" title="entries" style="display:none;">'+entries+'</td>'+
                '<td class="d-content" title="confname">'+confname+'</td>'+
                '<td class="last">'+
                 '<button type="button" class="btn btn-cacheconfig btn-info btn-xs" data-toggle="modal" data-target=".modal-cacheconfig" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
                    '<th class="column-title">缓存总数量</th>'+
                    '<th class="column-title">进入缓存下限</th>'+
                    '<th class="column-title">最大缓存时间</th>'+
                    '<th class="column-title">故障域名保持时间</th>'+
                    '<th class="column-title">过期保留时间</th>'+
                    '<th class="column-title">是否缓存时间自减</th>'+
                    '<th class="column-title no-link last"><span class="nobr">操作</span></th>'+
                    '<th class="bulk-actions" colspan="6">'+
                      '<a class="antoo" id="del_data" name="host" style="color:#fff; font-weight:500;cursor:pointer;">批量删除 ( <span class="action-cnt"> </span> ) <i class="fa fa-chevron-down"></i></a>'+
                    '</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody>'+dom+'</tbody></table>';*/
    $('#node1').html(dom);
    create_icheck();
}