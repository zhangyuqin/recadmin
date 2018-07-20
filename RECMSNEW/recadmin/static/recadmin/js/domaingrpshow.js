$(function(){
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var domaingroup = new requestData();

    var url = '/api/v1/domain_group/'    
    var type = 'get';
    domaingroup.ajaxData(url,type,null,function(data){ 
        renderDom(data);
    });
    //添加和更新
    $(document).on("click",".btn-domaingroup",function(){
        var domain_attr = $(this).attr("title"); 
        //添加和更新用这个title属性判断，将对应的dom放入modal中
        console.log(domain_attr);
        if(domain_attr == 'add'){
            // 添加分组  modal dom
            var group_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">域名分组</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            
            var group_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">分组名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" title="">'+
                        '</div></div>';
            var group_tag = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="tag">标签</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="tag" required="required" class="form-control col-md-7 col-xs-12" name="tag">'+
                        '</div></div>';
            var group_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                            '</div></div></div></div>';
            var group_html = group_header+group_name+group_tag+group_footer;
                
            $('#modal-domaingroup').html(group_html);            
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
            //更新   modal dom
            var group_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">域名分组</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">'; 
            var group_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name-update">分组名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name-update" required="required" class="form-control col-md-7 col-xs-12" name="name" title="" value = "'+content.name+'">'+
                        '</div>'+
                    '</div>';
            var group_tag = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="tag-update">标签</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="tag-update" required="required" class="form-control col-md-7 col-xs-12" name="tag" value="'+content.tag+'">'+
                        '</div>'+
                    '</div>';    
            var group_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                            '</div></div></div></div>';
            var group_html = group_header+group_name+group_tag+group_footer;
                
            $('#modal-domaingroup').html(group_html);                
        }  
    });

      //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            name:null,
            tag:null
        };
        datas.name = $('input[name="name"]').val();
        datas.tag = $('input[name="tag"]').val();
        var type = 'post';
        domaingroup.ajaxData(url,type,datas,function(data){
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
                    '<td class="d-content" title="tag">'+data.tag+'</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-domaingroup btn-info btn-xs" data-toggle="modal" data-target=".modal-domaingroup" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
            tag:null
        };
        datas.name = $('input[name="name"]').val();
        datas.tag = $('input[name="tag"]').val();
        var type = 'put';
        var url = '/api/v1/domain_group/'+content.id+'/';
        domaingroup.ajaxData(url,type,datas,function(data){
            //window.location.reload();
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var html ='<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+data.id+'</td>'+
                    '<td class="d-content" title="name">'+data.name+'</td>'+
                    '<td class="d-content" title="tag">'+data.tag+'</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-domaingroup btn-info btn-xs" data-toggle="modal" data-target=".modal-domaingroup" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
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
        var url ='/api/v1/domain_group/'+dcontent.id+'/'
        domaingroup.ajaxData(url,type,dcontent,function(data){
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
                tag = val.tag;
            dom+='<tr class="even pointer">'+
                    '<td class="a-center">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+id+'</td>'+
                    '<td class="d-content" title="name">'+name+'</td>'+
                    '<td class="d-content" title="tag">'+tag+'</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-domaingroup btn-info btn-xs" data-toggle="modal" data-target=".modal-domaingroup" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                    '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
                '</tr>';
        });
        $('#node1').html(dom);
    }
    create_icheck();
}      