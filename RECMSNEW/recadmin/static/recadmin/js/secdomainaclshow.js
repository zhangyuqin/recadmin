$(function(){
    //添加和更新
    var content = {
        trdom :null
    };
    //ajax 获取数据
    var secdomain = new requestData();

    var url = '/api/v1/security_domain_acl/'    
    var type = 'get';
    secdomain.ajaxData(url,type,null,function(data){ 
        console.log(data);
        window.groupdata = data.DomainGroup;
        renderDom(data.SecDomainACL);
    });

    $(document).on("click",".btn-secdomain",function(){
        var domain_attr = $(this).attr("title"); 
        //添加和更新用这个title属性判断，将对应的dom放入modal中
        console.log(domain_attr);
        if(domain_attr == 'add'){
            var groupdata = renderPool(window.groupdata,null);
            var secdomain_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">防污染域名acl</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            var secdomain_acl = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="acl">ACL</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="acl" required="required" class="form-control col-md-7 col-xs-12" name="acl">'+
                        '</div></div>';
            var secdomain_grouplist = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">DNS服务器</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="servers" id="servers" multiple="multiple">'+
                                groupdata+
                            '</select>'+ 
                        '</div></div>';  
            var secdomain_note = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="note">备注信息</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="note" required="required" class="form-control col-md-7 col-xs-12" name="note">'+
                        '</div></div>';
            var secdomain_status ='<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">状态</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+
                                '<input type="radio" class="switch-input" name="status" value="1" id="addone" checked>'+
                                '<label for="addone" class="switch-label switch-label-off">启用</label>'+
                                '<input type="radio" class="switch-input" name="status" value="0" id="addzero">'+
                                '<label for="addzero" class="switch-label switch-label-on">停用</label>'+
                                '<span class="switch-selection"></span></div></div></div>';

            var secdomain_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                            '</div></div></div></div>';
            var secdomain_html = secdomain_header+secdomain_acl+secdomain_grouplist+secdomain_note+secdomain_status+secdomain_footer;
            $('#modal-secdomain').html(secdomain_html);
        }else if(domain_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            content.trdom = $(this).parent().parent();
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                var that = $(val).children();
                if(that.length != 0){
                    if(title == 'dgroup'){
                        var val = [];
                        var pdom = that;
                        for(var i=0;i<pdom.length;i++){
                            var dgroup = {id:null,name:null};
                            dgroup.id = parseInt($(pdom[i]).attr('id'));
                            dgroup.name = $(pdom[i]).text();
                            val.push(dgroup);
                        }
                    }else{
                        var val = $(val).children().text();
                    } 
                }else{
                    var val = $(val).text();
                }  
                content[title] = val;
            });
            console.log(content);
            var groupdata = renderServer(window.groupdata,content.dgroup);
            //更新modal dom
            var secdomain_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">防污染域名acl</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
            var secdomain_acl = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="acl">ACL</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="acl" required="required" class="form-control col-md-7 col-xs-12" name="acl" value="'+content.acl+'">'+
                        '</div></div>';
            var secdomain_grouplist = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">DNS服务器</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<select class="form-control" name="servers" id="servers" multiple="multiple">'+
                                groupdata+
                            '</select>'+ 
                        '</div></div>';  
            var secdomain_note = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="note">备注信息</label>'+
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

            var secdomain_status = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="record">状态</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<div class="switch switch-blue">'+status_input+'</div>'+
                        '</div></div>';

            var secdomain_footer = '<div class="ln_solid"></div>'+
                        '<div class="form-group">'+
                            '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                                '<button type="submit" class="btn btn-success btn-update">确定</button>'+
                            '</div></div></div></div>';
            var secdomain_html = secdomain_header+secdomain_acl+secdomain_grouplist+secdomain_note+secdomain_status+secdomain_footer;
            $('#modal-secdomain').html(secdomain_html);                               

        }
    });

      //添加
    $(document).on('click','.btn-add',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            acl:null,
            domaingroups:[],
            note:null,
            status:null
        };
        datas.acl = $('input[name="acl"]').val();
        datas.note = $('input[name="note"]').val();
        $('select[name="servers"] option:selected').each(function(){
            datas.domaingroups.push(parseInt($(this).val()));
        });
        datas.status = $('input[name="status"]:checked').val();    
        var type = 'post';
        secdomain.ajaxData(url,type,datas,function(data){
            window.location.reload();
            /*$('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var groupname = '';
            for(var i = 0; i<data.domaingroups.length;i++){
                groupname+= '<p id="'+data.domaingroups[i].id+'">'+data.domaingroups[i].name+'</p>';
            }
            var html = '<tr class="even pointer">'+
                    '<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+data.id+'</td>'+
                    '<td class="d-content" title="acl">'+data.acl+'</td>'+
                    '<td class="d-content" title="dgroup">'+groupname+'</td>'+
                    '<td class="d-content" title="note">'+data.note+'</td>'+
                    '<td class="d-content" title="status">'+
                    (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                    '</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-secdomain btn-info btn-xs" data-toggle="modal" data-target=".modal-secdomain" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                    '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
            '</tr>';
            $('.table tbody').append(html);
            create_icheck();*/
        });
    });

    //更新
    $(document).on('click','.btn-update',function(){
        $('.btn-success').attr('disabled',true);
        var datas = {
            acl:null,
            domaingroups:[],
            note:null,
            status:null
        };
        datas.acl = $('input[name="acl"]').val();
        datas.note = $('input[name="note"]').val();
        $('select[name="servers"] option:selected').each(function(){
            datas.domaingroups.push(parseInt($(this).val()));
        });
        datas.status = $('input[name="status"]:checked').val(); 
        var type = 'put';
        var url = '/api/v1/security_domain_acl/'+content.id+'/';
        secdomain.ajaxData(url,type,datas,function(data){
            window.location.reload();
           /* $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
            var groupname = '';
            for(var i = 0; i<data.domaingroups.length;i++){
                groupname+= '<p id="'+data.domaingroups[i].id+'">'+data.domaingroups[i].name+'</p>';
            }
            var html ='<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+data.id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+data.id+'</td>'+
                    '<td class="d-content" title="acl">'+data.acl+'</td>'+
                    '<td class="d-content" title="dgroup">'+groupname+'</td>'+
                    '<td class="d-content" title="note">'+data.note+'</td>'+
                    '<td class="d-content" title="status">'+
                    (data.status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                    '</td>'+
                    '<td class="last">'+
                    '<button type="button" class="btn btn-secdomain btn-info btn-xs" data-toggle="modal" data-target=".modal-secdomain" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                    '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>';
            content.trdom.html(html); 
            create_icheck(); */
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
        var url ='/api/v1/security_domain_acl/'+dcontent.id+'/'
        secdomain.ajaxData(url,type,dcontent,function(data){
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
                acl = val.acl,
                note = val.note,
                groupname = '',
                status = val.status; 
                for(var i = 0; i<val.domaingroups.length;i++){
                    groupname+= '<p id="'+val.domaingroups[i].id+'">'+val.domaingroups[i].name+'</p>';
                }
            dom+='<tr class="even pointer">'+
                    '<td class="a-center ">'+
                        '<input type="checkbox" class="flat" name="table_records" value="'+id+'">'+
                    '</td>'+
                    '<td class="d-content" title="id">'+id+'</td>'+
                    '<td class="d-content" title="acl">'+acl+'</td>'+
                    '<td class="d-content" title="dgroup">'+groupname+'</td>'+
                    '<td class="d-content" title="note">'+note+'</td>'+
                    '<td class="d-content" title="status">'+
                    (status == 1 ? '<span class="btn btn-success btn-xs">启用</span>':'<span class="btn btn-danger btn-xs">停用</span>')+
                    '</td>'+
                    '<td class="last">'+
                     '<button type="button" class="btn btn-secdomain btn-info btn-xs" data-toggle="modal" data-target=".modal-secdomain" title="update"><i class="fa fa-pencil"></i> 更新</button>'+
                    '| <button type="button" class="btn btn-danger btn-xs btn-delete" title="delete"><i class="fa fa-trash-o"></i> 删除</button></td>'+
                '</tr>';
        });
        $('#node1').html(dom);
        create_icheck();
    }
}    