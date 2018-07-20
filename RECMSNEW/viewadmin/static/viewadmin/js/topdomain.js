$(function(){
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var top_domain = new requestData();

    var url = '/api/v1/top_domain/'    
    var type = 'get';
    top_domain.ajaxData(url,type,null,function(data){ 
        window.pooldata = data.Pool;
        renderDom(data.TopDomain);
    });
    //添加和更新
    $(document).on("click", ".btn-topdomain",function(){
        var domain_attr = $(this).attr("title"); 
        //添加和更新用这个title属性判断，将对应的dom放入modal中
        console.log(domain_attr);
        if(domain_attr == 'add'){
            var pooloption  = renderPool(window.pooldata,null);
            // 添加名称  modal dom
            var topdomain_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">热门域名</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            
            var topdomain_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="source">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name">'+
                        '</div></div>';
            var topdomain_domain =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="source">域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12 domainVaild" name="domain">'+
                        '</div></div>';                      
            var topdomain_cdns = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">选择运营商接入</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="cdns">'+pooloption+
                        '</select></div></div>';             
            var topdomain_note =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="note">备注</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note">'+
                        '</div></div>';                                        
            var topdomain_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-add btn-success">确定</button>'+
                        '</div></div></div></div>';
            var topdomain_html = topdomain_header+topdomain_name+topdomain_domain+topdomain_cdns+topdomain_note+topdomain_footer;
                
            $('#modal-topdomain').html(topdomain_html);            
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
            var pooloption  = renderPool(window.pooldata,content.cdns);
            //更新   modal dom
            var topdomain_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">热门域名</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            
            var topdomain_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" value="'+content.name+'">'+
                        '</div></div>';
            var topdomain_domain =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="source">域名</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="domain" required="required" class="form-control col-md-7 col-xs-12" name="domain" value="'+content.domain+'">'+
                        '</div></div>';                      
            var topdomain_cdns = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">选择运营商接入</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="cdns">'+pooloption+
                            '</select></div></div>';              
            var topdomain_note =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="note">备注</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note" value="'+content.note+'">'+
                        '</div></div>';                                        
            var topdomain_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<input type="hidden" name="cdns">'+
                            '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-update btn-success">确定</button>'+
                        '</div></div></form></div>';
            var topdomain_html = topdomain_header+topdomain_name+topdomain_domain+topdomain_cdns+topdomain_note+topdomain_footer;
                
            $('#modal-topdomain').html(topdomain_html);                       
        }  
    }); 

     //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            name:null,
            domain:null,
            cdns:null,
            note:null 
        };
        datas.name = $('input[name="name"]').val();
        datas.domain = $('input[name="domain"]').val();
        datas.cdns = $('select[name="cdns"] option:selected').val();
        var cdnsname = $('select[name="cdns"] option:selected').text();
        datas.note = $('input[name="note"]').val();
        var type = 'post';
        top_domain.ajaxData(url,type,datas,function(data){
            // console.log(data);
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html = '<tr class="even pointer">'+
                    '<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+data.id+'</td>'+
                    '<td class="d-content" title="name">'+data.name+'</td>'+
                    '<td class="d-content" title="domain">'+data.domain+'</td>'+
                    '<td class="d-content" title="cdns" style="display:none;">'+data.cdns+'</td>'+
                    '<td class="d-content" title="cdnsname">'+cdnsname+'</td>'+
                    '<td class="d-content" title="note">'+data.note+'</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-topdomain btn-info btn-xs" data-toggle="modal" data-target=".modal-topdomain" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
            domain:null,
            cdns:null,
            note:null 
        };
        datas.name = $('input[name="name"]').val();
        datas.domain = $('input[name="domain"]').val();
        datas.cdns = $('select[name="cdns"] option:selected').val();
        var cdnsname = $('select[name="cdns"] option:selected').text();
        datas.note = $('input[name="note"]').val();
        var type = 'put';
        var url = '/api/v1/top_domain/'+content.id+'/';
        top_domain.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html ='<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+data.id+'</td>'+
                    '<td class="d-content" title="name">'+data.name+'</td>'+
                    '<td class="d-content" title="domain">'+data.domain+'</td>'+
                    '<td class="d-content" title="cdns" style="display:none;">'+data.cdns+'</td>'+
                    '<td class="d-content" title="cdnsname">'+cdnsname+'</td>'+
                    '<td class="d-content" title="note">'+data.note+'</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-topdomain btn-info btn-xs" data-toggle="modal" data-target=".modal-topdomain" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
        var url ='/api/v1/top_domain/'+dcontent.id+'/'
        top_domain.ajaxData(url,type,dcontent,function(data){
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
                domain = val.domain,
                pool = val.cdns.id,
                poolname = val.cdns.name,
                note = val.note;
            dom+='<tr class="even pointer">'+
                    '<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+id+'</td>'+
                    '<td class="d-content" title="name">'+name+'</td>'+
                    '<td class="d-content" title="domain">'+domain+'</td>'+
                    '<td class="d-content" title="cdns" style="display:none;">'+pool+'</td>'+
                    '<td class="d-content" title="cdnsname">'+poolname+'</td>'+
                    '<td class="d-content" title="note">'+note+'</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-topdomain btn-info btn-xs" data-toggle="modal" data-target=".modal-topdomain" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                    '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
                '</tr>';
        });
        $('#node1').html(dom);
    } 
    create_icheck();
}           