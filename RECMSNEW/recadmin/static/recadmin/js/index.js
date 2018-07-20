//首页数据展示
function update(){
    $.ajax({
        url: 'stats/',
        type: 'GET',
        dataType: 'json',
        /*headers: {
            "Authorization":"Basic UG93ZXJETlM6Z2VoZWltMg=="
        },*/
        success: function(data, x, y) {
            console.log(data);
            $("#questions").text(data["queries"]);
            moment.locale('zh-cn');
            var uptime = moment.duration(data["uptime"]*1000.0).humanize()
            $("#uptime").text(uptime);

            var qps=1.0*data["queries"]/data["uptime"];
            $("#qps").text(qps.toFixed(2));

            $("#cache-hits").text(data["cache-hits"]);
            $("#cache-misses").text(data["cache-misses"]);

            var memory = data["real-memory-usage"]/1024/1024;
                memory = memory.toFixed(2)+"M";
            $("#memory").text(memory);

        },
        error:  function() {

        },
    });
}
function topn(){
    $.ajax({
        url: 'status/',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data);
            var data = data;
            $.each(data,function(key){
                if(key == 'domain'){
                    var val = data[key];
                    var html = ''
                    for(var i in val){
                        var num = parseInt(i)+1;
                        html+='<tr class="even pointer">'+
                                '<td class="">'+num+'</td>'+
                                '<td class="">'+val[i]+'</td>'+
                               '</tr>'; 
                    }
                    var dom = '<table class="table table-striped jambo_table bulk_action">'+
                                '<thead>'+
                                    '<tr class="headings">'+
                                        '<th class="column-title">id</th>'+
                                        '<th class="column-title">域名<i class="fa fa-chevron-down fa-table-down" style="float:right"></i></th>'+
                                    '</tr>'+
                                '</thead>'+
                                '<tbody class="active">'+html+'</tbody>'+
                              '</table>';
                    $('#top-domain').html(dom);         
                    
                }else if(key == 'client'){
                    var val = data[key];
                    var html = ''
                    for(var i in val){
                        var num = parseInt(i)+1;
                        html+='<tr class="even pointer">'+
                                '<td class="">'+num+'</td>'+
                                '<td class="">'+val[i]+'</td>'+
                               '</tr>'; 
                    }
                    var dom = '<table class="table table-striped jambo_table bulk_action">'+
                                '<thead>'+
                                    '<tr class="headings">'+
                                        '<th class="column-title">id</th>'+
                                        '<th class="column-title">用户<i class="fa fa-chevron-down fa-table-down" style="float:right"></i></th>'+
                                    '</tr>'+
                                '</thead>'+
                                '<tbody class="active">'+html+'</tbody>'+
                              '</table>';
                    $('#top-client').html(dom);  
           
                }else if(key == 'servfail'){
                    var val = data[key];
                    var html = ''
                    for(var i in val){
                        var num = parseInt(i)+1;
                        html+='<tr class="even pointer">'+
                                '<td class="">'+num+'</td>'+
                                '<td class="">'+val[i]+'</td>'+
                               '</tr>'; 
                    }
                    var dom = '<table class="table table-striped jambo_table bulk_action">'+
                                '<thead>'+
                                    '<tr class="headings">'+
                                        '<th class="column-title">id</th>'+
                                        '<th class="column-title">域名<i class="fa fa-chevron-down fa-table-down" style="float:right"></i></th>'+
                                    '</tr>'+
                                '</thead>'+
                                '<tbody class="active">'+html+'</tbody>'+
                              '</table>';
                    $('#top-servfail').html(dom); 
           
                }else if(key == 'nxdomain'){
                    var val = data[key];
                    var html = ''
                    for(var i in val){
                        var num = parseInt(i)+1;
                        html+='<tr class="even pointer">'+
                                '<td class="">'+num+'</td>'+
                                '<td class="">'+val[i]+'</td>'+
                               '</tr>'; 
                    }
                    var dom = '<table class="table table-striped jambo_table bulk_action">'+
                                '<thead>'+
                                    '<tr class="headings">'+
                                        '<th class="column-title">id</th>'+
                                        '<th class="column-title">域名<i class="fa fa-chevron-down fa-table-down" style="float:right"></i></th>'+
                                    '</tr>'+
                                '</thead>'+
                                '<tbody class="active">'+html+'</tbody>'+
                              '</table>';
                    $('#top-nxdomain').html(dom);   
                }
            });
            //left-col 赋值
           /* var left_col_height = $('.main_container').height()+26+'px';
            $('.left_col').css('min-height',left_col_height);*/
        },
        error:  function(err) {
            console.log(err);
        },
    });
}

$(document).ready(function() {        
    update();
    topn();
    $(document).on("click",".fa-table-down",function(){
        var $tbody = $(this).parent().parent().parent().next();
        if($tbody.is('.active')){
            $tbody.removeClass('active');
            $($tbody).slideUp(); 
        }else{
            $tbody.addClass('active');
            $($tbody).slideDown();
        }
    });
}); 
