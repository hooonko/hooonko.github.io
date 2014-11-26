require([
    "jquery",
    "app/db",
    "moment",
    "bootstrap",
    "datepicker"
], function($, DB, moment) {

    DB.indexedDB.setLoggingDom($('#logWrap'));
    // init DB
    DB.indexedDB.open(initUI);

    // set reset DB button
    $('#resetDBButton').on('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure RESET your Database?')) {
            DB.indexedDB.dropdatabase();
        }
    })
var LOGGER = DB.indexedDB.printLog;

    var typeLoaded = $.Callbacks( "once" );
    var methodLoaded = $.Callbacks( "once" );
    var dataLoaded = $.Callbacks( "once" );

    function initUI() {
        LOGGER('initUI');
        loadListFromDB();

        typeLoaded.add(function() {
            LOGGER('typeLoaded Callback Executed!');
            initTypeModal();
            $('#registTypeButton').show();

            if ($('#registMethodButton').css('display') !== 'none') {
                dataLoaded.fire();
            }
        });
        methodLoaded.add(function() {
            LOGGER('methodLoaded Callback Executed!');
            initMethodModal();
            $('#registMethodButton').show();

            if ($('#registTypeButton').css('display') !== 'none') {
                dataLoaded.fire();
            }
        });
        dataLoaded.add(function() {
            initRegistModal();
            $('#registIOButton').show();
        });

        loadTypeFromDB(function() {
            LOGGER('typeLoaded Fire!');
            typeLoaded.fire();
        });
        loadMethodFromDB(function() {
            LOGGER('methodLoaded Fire!');
            methodLoaded.fire();
        });
    };

    function loadTypeFromDB(callback) {
        DB.indexedDB.getAllType(function(data) {
            LOGGER('Type Loaded!');
            refreshTypeUIInRegistData(data);
            refreshTypeUIInManageType(data);
            if ($.isFunction(callback)) {
                LOGGER('getAllType Callback Fire!');
                callback();
            }
        });
    };

    function refreshTypeUIInRegistData(data) {
        var typeListHtml = '';
        for (var i = 0; i < data.length; i++) {
            typeItem = data[i].value;
            typeListHtml += '<option value="' + typeItem.type + '" data-io="' + typeItem.io + '">' + typeItem.type + '</option>';
        }
        $('#ioType').html(typeListHtml);
    };

    function refreshTypeUIInManageType(data) {
        var typeListHtml = '<table class="table table-condensed" id="typeList">';
        typeListHtml += '<tr>';
        typeListHtml +=     '<th>Type</th>';
        typeListHtml +=     '<th>I/O</th>';
        typeListHtml +=     '<th></th>';
        typeListHtml += '</tr>';
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                typeKey = data[i].key;
                typeItem = data[i].value;
                typeListHtml += '<tr>';
                typeListHtml +=     '<td>' + typeItem.type + '</td>';
                typeListHtml +=     '<td>' + typeItem.io + '</td>';
                typeListHtml +=     '<td><button class="btn btn-danger btn-xs delete-type" data-key="' + typeKey + '"><i class="glyphicon glyphicon-remove"></i></button></td>';
                typeListHtml += '</tr>';
            }
        } else {
            typeListHtml += '<tr>';
            typeListHtml +=     '<td colspan="3">No types.</td>';
            typeListHtml += '</tr>';
        }
        typeListHtml += '</table>'
        if ($('#typeList').length > 0)
            $('#typeList').replaceWith(typeListHtml);
        else
            $('#manageTypeModal div.modal-body').prepend(typeListHtml);

        $('#typeList button.delete-type').on('click', function(e) {
            e.preventDefault();

            if (confirm('Are you sure delete type?')) {
                DB.indexedDB.deleteType({
                    data: {
                        key: parseInt($(this).attr('data-key'))
                    },
                    success: loadTypeFromDB
                });
            }
        });

        $('#')
    };

    function loadMethodFromDB(callback) {
        DB.indexedDB.getAllMethod(function(data) {
            LOGGER('Method Loaded!');
            refreshMethodUIInRegistData(data);
            refreshMethodUIInManageMethod(data);
            if ($.isFunction(callback)) {
                LOGGER('getAllMethod Callback Fire!');
                callback();
            }
        });
    };

    function refreshMethodUIInRegistData(data) {
        var methodListHtml = '<option value="Cash">Cash</option>';
        for (var i = 0; i < data.length; i++) {
            methodItem = data[i].value;
            methodListHtml += '<option value="' + methodItem.name + '">' + methodItem.name + '</option>';
        }
        $('#ioMethod').html(methodListHtml);
    };

    function refreshMethodUIInManageMethod(data) {
        var methodListHtml = '<table class="table table-condensed" id="methodList">';
        methodListHtml += '<tr>';
        methodListHtml +=     '<th>Name</th>';
        methodListHtml +=     '<th>Type</th>';
        methodListHtml +=     '<th>Bill</th>';
        methodListHtml +=     '<th>Period</th>';
        methodListHtml +=     '<th></th>';
        methodListHtml += '</tr>';
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                methodKey = data[i].key;
                methodItem = data[i].value;
                methodListHtml += '<tr>';
                methodListHtml +=     '<td>' + methodItem.name + '</td>';
                methodListHtml +=     '<td>' + methodItem.type + '</td>';
                if (methodItem.type === 'CreditCard') {
                    methodListHtml +=     '<td>' + methodItem.billing_day + '</td>';
                    methodListHtml +=     '<td>'
                    if (methodItem) {
                        methodListHtml +=     '<i class="glyphicon glyphicon-credit-card"></i> ' + methodItem.use_period_start_day;
                        methodListHtml +=     '<br/><i class="glyphicon glyphicon-usd"></i> ' + methodItem.cash_period_start_day;
                    }
                    methodListHtml +=     '</td>';
                } else {
                    methodListHtml +=     '<td>Direct</td>';
                    methodListHtml +=     '<td></td>';
                }
                methodListHtml +=     '<td><button class="btn btn-danger btn-xs delete-type" data-key="' + methodKey + '"><i class="glyphicon glyphicon-remove"></i></button></td>';
                methodListHtml += '</tr>';
            }
        } else {
            methodListHtml += '<tr>';
            methodListHtml +=     '<td colspan="5">No cards.</td>';
            methodListHtml += '</tr>';
        }
        methodListHtml += '</table>'
        if ($('#methodList').length > 0)
            $('#methodList').replaceWith(methodListHtml);
        else
            $('#manageMethodModal div.modal-body').prepend(methodListHtml);

        $('#methodList button.delete-type').on('click', function(e) {
            e.preventDefault();

            if (confirm('Are you sure delete type?')) {
                DB.indexedDB.deleteMethod({
                    data: {
                        key: parseInt($(this).attr('data-key'))
                    },
                    success: loadMethodFromDB
                });
            }
        });
    };

    function loadListFromDB(callback) {
        DB.indexedDB.getAllIO(function(data) {
            refreshIOList(data);
            LOGGER('List Loaded!');
            if ($.isFunction(callback)) {
                callback();
            }
        });
    };

    function refreshIOList(data) {
        var listHtml = '<table class="table table-condensed">';
        listHtml += '<tr>';
        listHtml +=     '<th>Date</th>';
        listHtml +=     '<th>Type</th>';
        listHtml +=     '<th>Method</th>';
        listHtml +=     '<th>Money</th>';
        listHtml +=     '<th></th>';
        listHtml += '</tr>';
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                ioKey = data[i].key;
                ioItem = data[i].value;
                if (ioItem.io === 'in') {
                    listHtml += '<tr class="info">';
                } else {
                    listHtml += '<tr>';
                }
                listHtml +=     '<td>' + moment(ioItem.date).format('M/D') + '</td>';
                listHtml +=     '<td>' + ioItem.type + '</td>';
                if (ioItem.method === 'Cash') {
                    listHtml +=     '<td><i class="glyphicon glyphicon-usd"></i></td>';
                } else {
                    listHtml +=     '<td><i class="glyphicon glyphicon-credit-card"></i> ' + ioItem.method + '</td>';
                }
                listHtml +=     '<td>' + ioItem.money + '</td>';
                listHtml +=     '<td><button class="btn btn-danger btn-xs delete-type" data-key="' + ioKey + '"><i class="glyphicon glyphicon-remove"></i></button></td>';
                listHtml += '</tr>';
            }
        } else {
            listHtml += '<tr>';
            listHtml +=     '<td colspan="6">No IOs.</td>';
            listHtml += '</tr>';
        }
        listHtml += '</table>';

        $('#listWrap').html(listHtml);

        $('#listWrap button.delete-type').on('click', function(e) {
            e.preventDefault();

            if (confirm('Are you sure delete IO data?')) {
                DB.indexedDB.deleteIO({
                    data: {
                        key: parseInt($(this).attr('data-key'))
                    },
                    success: loadListFromDB
                });
            }
        });
    };
    
    function initTypeModal() {
        $('#manageTypeModal').keypress(function(event) {
            if ( event.which == 13 ) {
                event.preventDefault();
                $('#registTypeForm').submit();
                return false;
            }
        });
        $('#registTypeForm').submit(function(){
            var type = $(this).find('input[name="type"]').val();
            if (type === "") {
                alert('Please put type name!');
                $(this).find('input[name="type"]').focus();
                return false;
            }

            var io = $(this).find('input[name="io"]:checked').val();

            DB.indexedDB.addType({
                data: {
                    type: type,
                    io: io,
                    id: 'type/' + (new Date().getTime())
                },
                success : function() {
                    $('#registTypeForm').find('input[name="type"]').val('');
                    loadTypeFromDB();
                }
            });



            return false;
        });
    };
    
    function initMethodModal() {
        $('#manageMethodModal').keypress(function(event) {
            if ( event.which == 13 ) {
                event.preventDefault();
                return false;
            }
        });

        var typeChangeListener = function(cardType) {
            if (cardType === "CreditCard") {
                $('div.form-group').has('input[name="billing_day"]').show();
                $('div.form-group').has('input[name="use_period_start_day"]').show();
                $('div.form-group').has('input[name="cash_period_start_day"]').show();
            } else {
                $('div.form-group').has('input[name="billing_day"]').hide();
                $('div.form-group').has('input[name="use_period_start_day"]').hide();
                $('div.form-group').has('input[name="cash_period_start_day"]').hide();
            }
        };
        $('#registMethodForm div.btn-group').has('input[name="type"]').change(function(e) {
            var cardType = $(this).find('input[name="type"]:checked').val();
            typeChangeListener(cardType);
        });
        typeChangeListener("CreditCard");

        $('#registMethodForm').submit(function(){
            var cardType = $(this).find('input[name="type"]:checked').val();
            var data = {
                type : cardType,
                name : $(this).find('input[name="name"]').val(),
                id: 'method/' + (new Date().getTime())
            };

            if (cardType === "CreditCard") {
                var billingDay = $(this).find('input[name="billing_day"]').val();
                if (billingDay === "") {
                    alert('Please put the billing day!');
                    $(this).find('input[name="billing_day"]').focus();
                    return false;
                }
                if (isNaN(billingDay) || !parseInt(billingDay) || parseInt(billingDay) < 0) {
                    alert('Please check the billing day!');
                    $(this).find('input[name="billing_day"]').focus();
                    return false;
                }
                data.billing_day = parseInt(billingDay);

                var usingPeriodStartDay = $(this).find('input[name="use_period_start_day"]').val();
                if (usingPeriodStartDay === "") {
                    alert('Please put the Start Day of Using Period!');
                    $(this).find('input[name="use_period_start_day"]').focus();
                    return false;
                }
                if (isNaN(usingPeriodStartDay) || !parseInt(usingPeriodStartDay) || parseInt(usingPeriodStartDay) < 0) {
                    alert('Please check the Start Day of Using Period!');
                    $(this).find('input[name="use_period_start_day"]').focus();
                    return false;
                }
                data.use_period_start_day = parseInt(usingPeriodStartDay);

                var cashPeriodStartDay = $(this).find('input[name="cash_period_start_day"]').val();
                if (cashPeriodStartDay === "") {
                    alert('Please put the Start Day of Cash Service Period!');
                    $(this).find('input[name="cash_period_start_day"]').focus();
                    return false;
                }
                if (isNaN(cashPeriodStartDay) || !parseInt(cashPeriodStartDay) || parseInt(cashPeriodStartDay) < 0) {
                    alert('Please check the Start Day of Cash Service Period!');
                    $(this).find('input[name="cash_period_start_day"]').focus();
                    return false;
                }
                data.cash_period_start_day = parseInt(cashPeriodStartDay);
            }

            DB.indexedDB.addMethod({
                data: data,
                success : function() {
                    $('#registMethodForm').find('input[name="name"]').val('');
                    $('#registMethodForm').find('input[name="billing_day"]').val('');
                    $('#registMethodForm').find('input[name="use_period_start_day"]').val('');
                    $('#registMethodForm').find('input[name="cash_period_start_day"]').val('');
                    loadMethodFromDB();
                }
            });



            return false;
        });
    }

    function initRegistModal() {
        $('#putDataModal').keypress(function(event) {
            if ( event.which == 13 ) {
                event.preventDefault();
                $('#registIOForm').submit();
                return false;
            }
        });

        // set form
        $('#putDataModal .input-group.date').datepicker({
            autoclose: true,
            format: "yyyy-mm-dd"
        });
        $('#putDataModal .input-group.date').datepicker('update', new Date());

        var ioChangeListener = function(ioType) {
            if (ioType !== "in") {
                $('#ioType').find('option').show();
                $('#ioType').find('option[data-io="in"]').hide();
                $($('#ioType').find('option[data-io="out"]')[0]).prop('selected', true);

                $('#registIOForm div.form-group').has('#ioMethod').show();
            } else {
                $('#ioType').find('option').show();
                $('#ioType').find('option[data-io="out"]').hide();
                $($('#ioType').find('option[data-io="in"]')[0]).prop('selected', true);

                $('#ioMethod').find('option[name="Cash"]').prop('selected', true);
                $('#registIOForm div.form-group').has('#ioMethod').hide();
            }
        };
        $('#registIOForm div.btn-group').has('input[name="io"]').change(function(e) {
            var ioType = $(this).find('input[name="io"]:checked').val();
            ioChangeListener(ioType);
        });
        ioChangeListener("out");


        $('#registIOForm').submit(function(){
            var date = $(this).find('input[name="date"]').val();
            if (date !== "") {
                date = moment(date);
                if (!date.isValid()) {
                    alert('Please check the date!');
                    return false;
                }
                date = date.toDate().getTime();
            } else {
                alert('Please put the date!');
                $(this).find('input[name="date"]').focus();
                return false;
            }

            var io = $(this).find('input[name="io"]:checked').val();

            var type = $(this).find('select[name="type"]').val();

            var method = $(this).find('select[name="method"]').val();


            var money = $(this).find('input[name="money"]').val();
            if (money === "") {
                alert('Please put the money!');
                $(this).find('input[name="money"]').focus();
                return false;
            }
            if (isNaN(money) || !parseInt(money) || parseInt(money) < 0) {
                alert('Please check the money!');
                $(this).find('input[name="money"]').focus();
                return false;
            }
            money = parseInt(money);

            DB.indexedDB.addIO({
                data : {
                    date: date,
                    io: io,
                    type: type,
                    method: method,
                    money: money,
                    id: 'io/' + (new Date().getTime())
                },
                success: function() {
                    $('#putDataModal').modal('hide');
                    loadListFromDB();
                }
            });

            return false;
        })
    };
});