$(function(){
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var rule_traffic = new requestData();

    var url = '/api/v1/rule_traffic/'    
    var type = 'get';
    rule_traffic.ajaxData(url,type,null,function(data){ 
        window.pooldata = data.Pool;
        window.topdomain = data.TopDomain;
        console.log(data);
        renderDom(data.RuleTraffic);
    });
    //添加和更新
    $(document).on("click",".btn-ruletraffic",function(){
        var domain_attr = $(this).attr("title"); 
        //添加和更新用这个title属性判断，将对应的dom放入modal中
        console.log(domain_attr);
        if(domain_attr == 'add'){
            var pooloption  = renderPool(window.pooldata,null);
            //var qnameoption  = renderPool(window.qname,null);
            var qnameoption = renderdomain(window.topdomain,null);
            // 添加名称  modal dom
            var traffic_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">流量调度</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            
            var traffic_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name">'+
                        '</div></div>';
            var traffic_source =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="source">源运营商</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="source" required="required" class="form-control col-md-7 col-xs-12" name="source">'+
                        '</div></div>';            
            var traffic_qname =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="qname">域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="qname">'+qnameoption+'</select>'+
                        '</div></div>';                     
            var traffic_order =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="order">优先级</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="number" id="order" required="required" class="form-control col-md-7 col-xs-12" name="order">'+
                        '</div></div>'; 
            var traffic_acl =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="acl">用户网段<br/>多个acl用(,)隔开</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input class="form-control col-md-7 col-xs-12" name="acl" id="acl">'+
                        '</div></div>'; 
            var traffic_pools = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">选择运营商链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+
                        '</select></div></div>';       
            var traffic_note =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="note">备注</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note">'+
                        '</div></div>';             
            var traffic_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">状态</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+
                                '<input type="radio" class="switch-input" name="status" value="1" id="addone" checked>'+
                                '<label for="addone" class="switch-label switch-label-off">启用</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzero">'+
                                '<label for="addzero" class="switch-label switch-label-on">停用</label>'+
                                '<span class="switch-selection"></span>'+
                            '</div></div></div>';                             
            var traffic_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-add btn-success">确定</button>'+
                        '</div></div></div></div>';
            var traffic_html = traffic_header+traffic_name+traffic_source+traffic_qname+traffic_acl+traffic_pools+traffic_order+traffic_note+traffic_status+traffic_footer;   
            $('#modal-ruletraffic').html(traffic_html);            
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
            var pooloption  = renderPool(window.pooldata,content.pool);
            var qnameoption = renderdomain(window.topdomain,content.qname);
            //更新   modal dom
            var traffic_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">流量调度</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            
            var traffic_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" value="'+content.name+'">'+
                        '</div></div>';
            var traffic_source =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="source">源运营商</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="source" required="required" class="form-control col-md-7 col-xs-12" name="source" value="'+content.source+'">'+
                        '</div></div>';            
            var traffic_qname =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="qname">域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="qname">'+qnameoption+'</select>'+
                        '</div></div>';                     
            var traffic_order =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="order">优先级</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="number" id="order" required="required" class="form-control col-md-7 col-xs-12" name="order" value="'+content.order+'">'+
                        '</div></div>'; 
            var traffic_acl =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="acl">用户网段<br/>多个acl用(,)隔开</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input class="form-control col-md-7 col-xs-12" name="acl" id="acl" value="'+content.acl+'">'+
                        '</div></div>'; 
            var traffic_pools = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">选择运营商链路</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="pool">'+pooloption+'</select>'+
                        '</div></div>';             
            var traffic_note =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="note">备注</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note" value="'+content.note+'">'+
                        '</div></div>';   
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
            var traffic_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">状态</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+status_input+'</div></div></div>';                             
            var traffic_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-update btn-success">确定</button>'+
                        '</div></div></div></div>';
            var traffic_html = traffic_header+traffic_name+traffic_source+traffic_qname+traffic_acl+traffic_pools+traffic_order+traffic_note+traffic_status+traffic_footer;   
            $('#modal-ruletraffic').html(traffic_html);                        
        }  
    });

     //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            name:null,
            source:null,
            qname:null,
            acl:null,
            order:null,
            note:null,
            pool:null,
            status:null
        };
        datas.name = $('input[name="name"]').val();
        datas.source = $('input[name="source"]').val();
        datas.qname = $('select[name="qname"] option:selected').val();
        var qnamedomain = $('select[name="qname"] option:selected').text();
        datas.acl = $('input[name="acl"]').val();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.order = $('input[name="order"]').val();
        datas.note = $('input[name="note"]').val();
        datas.status = $('input[name="status"]:checked').val();
        var type = 'post';
        rule_traffic.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                    '<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+data.id+'</td>'+
                    '<td class="d-content" title="name">'+data.name+'</td>'+
                    '<td class="d-content" title="distaddress">'+data.source+'</td>'+
                    '<td class="d-content" title="qname" style="display:none;">'+data.qname+'</td>'+
                    '<td class="d-content" title="qnamedomain">'+qnamedomain+'</td>'+
                    '<td class="d-content" title="acl">'+data.acl+'</td>'+
                    '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                    '<td class="d-content" title="poolname">'+poolname+'</td>'+
                    '<td class="d-content" title="order">'+data.order+'</td>'+
                    '<td class="d-content" title="note">'+data.note+'</td>'+
                    '<td class="d-content" title="status">'+
                    (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                    '</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-ruletraffic btn-info btn-xs" data-toggle="modal" data-target=".modal-ruletraffic" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
            source:null,
            qname:null,
            acl:null,
            order:null,
            note:null,
            pool:null,
            status:null
        };
        datas.name = $('input[name="name"]').val();
        datas.source = $('input[name="source"]').val();
        datas.qname = $('select[name="qname"] option:selected').val();
        var qnamedoamin = $('select[name="qname"] option:selected').text();
        datas.acl = $('input[name="acl"]').val();
        datas.pool = $('select[name="pool"] option:selected').val();
        var poolname = $('select[name="pool"] option:selected').text();
        datas.order = $('input[name="order"]').val();
        datas.note = $('input[name="note"]').val();
        datas.status = $('input[name="status"]:checked').val();
        var type = 'put';
        var url = '/api/v1/rule_traffic/'+content.id+'/';
        rule_traffic.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html ='<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+data.id+'</td>'+
                    '<td class="d-content" title="name">'+data.name+'</td>'+
                    '<td class="d-content" title="source">'+data.source+'</td>'+
                    '<td class="d-content" title="qname" style="display:none;">'+data.qname+'</td>'+
                    '<td class="d-content" title="qnamedoamin">'+qnamedoamin+'</td>'+
                    '<td class="d-content" title="acl">'+data.acl+'</td>'+
                    '<td class="d-content" title="pool" style="display:none;">'+data.pool+'</td>'+
                    '<td class="d-content" title="poolname">'+poolname+'</td>'+
                    '<td class="d-content" title="order">'+data.order+'</td>'+
                    '<td class="d-content" title="note">'+data.note+'</td>'+
                    '<td class="d-content" title="status">'+
                    (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                    '</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-ruletraffic btn-info btn-xs" data-toggle="modal" data-target=".modal-ruletraffic" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
        var url ='/api/v1/rule_traffic/'+dcontent.id+'/'
        rule_traffic.ajaxData(url,type,dcontent,function(data){
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
    if(data.length ==0){
        console.log('没有数据');
    }else{
        $.each(data,function(key,val){
            var id = val.id,
                name = val.name,
                source = val.source,
                qname = val.qname.id,
                qnamedomain = val.qname.domain,
                acl = val.acl,
                order = val.order,
                note = val.note,
                pool = val.pool.id,
                poolname = val.pool.name,
                status = val.status;
            dom+='<tr class="even pointer">'+
                    '<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+id+'</td>'+
                    '<td class="d-content" title="name">'+name+'</td>'+
                    '<td class="d-content" title="source">'+source+'</td>'+
                    '<td class="d-content" title="qname" style="display:none;">'+qname+'</td>'+
                    '<td class="d-content" title="qnamedomain">'+qnamedomain+'</td>'+
                    '<td class="d-content" title="acl">'+acl+'</td>'+
                    '<td class="d-content" title="pool" style="display:none;">'+pool+'</td>'+
                    '<td class="d-content" title="poolname">'+poolname+'</td>'+
                    '<td class="d-content" title="order">'+order+'</td>'+
                    '<td class="d-content" title="note">'+note+'</td>'+
                    '<td class="d-content" title="status">'+
                    (status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                    '</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-ruletraffic btn-info btn-xs" data-toggle="modal" data-target=".modal-ruletraffic" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                    '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
                '</tr>';
        });
        $('#node1').html(dom);
    } 
    create_icheck();
} 

