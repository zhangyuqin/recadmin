//下拉框左右选择
$(function(){ 
    $(document).on('click','#add',function() {
        $('#select1 option:selected').appendTo('#select2');
    });

    $(document).on('click','#remove',function() {
        $('#select2 option:selected').appendTo('#select1');
    });
 
    $(document).on('click','#add-all',function() {
        $('#select1 option').appendTo('#select2');
    });
    $(document).on('click','#remove-all',function() {
        $('#select2 option').appendTo('#select1');
    });

    $(document).on('dblclick','#select1',function(){ 
        $("option:selected",this).appendTo('#select2'); 
    });

    $(document).on('dblclick','#select2',function(){
       $("option:selected",this).appendTo('#select1');
    });
});