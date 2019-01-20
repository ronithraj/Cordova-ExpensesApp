/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

    }

};

app.initialize();

angular.module('expenseApp', []);

angular.module('expenseApp').controller('expenseController', function ($scope) {
    $scope.textDisable = false;
    $scope.amount = 0;
    $scope.reason;
    $scope.finalAmount = 0;
    $scope.hiddenOtherText;
    $scope.amountspent = 0;
    $scope.record = [];
    $scope.buttonDisplay = false;
    $scope.hideTable = true;
    $scope.hideButtons = true;
    $scope.buttonDisable = false;
    $scope.buttonCreate = true;
    $scope.dataButtons = true;
    $scope.newTransaction = function () {
        var myDB = window.sqlitePlugin.openDatabase({ name: "test.db", location: 'default' });
        myDB.transaction(function (transaction) {
            transaction.executeSql("DROP TABLE  IF EXISTS expenses_angjs ", [],
                function (tx, result) {
                    // alert('Successfully Created New Instance');
                },
                function (error) {
                    alert("Failed to Delete Old Data");
                });
        });
        $scope.dataButtons = false;
    }

    $scope.create = function () {
        if ($scope.amount) {
            $scope.finalAmount = $scope.amount;
            var myDB = window.sqlitePlugin.openDatabase({ name: "test.db", location: 'default' });
            myDB.transaction(function (transaction) {
                transaction.executeSql("DROP TABLE  IF EXISTS expenses_angjs ", [],
                    function (tx, result) {
                    },
                    function (error) {
                        alert("Failed to Delete");
                    });
            });
            $scope.textDisable = true;
            $scope.buttonDisable = true;
        }
        else {
            alert('Please Enter the valid amount ')
        }
    }
    // $scope.otherFunction = function(){
    //     alert("Clicked on others");
    //     $scope.hideText = !$scope.hideText;
    // }
    $scope.Submit = function () {
        var amountspentDB = $scope.amountspent;
        var originalAmount = $scope.amount;
        $scope.amount = $scope.amount - $scope.amountspent;
        if ($scope.amount > $scope.amountspent) {

            if ($scope.reason == "other") {

                var reasonDB = $scope.hiddenOtherText;
            }
            else {
                var reasonDB = $scope.reason;
            }
            if (null != reasonDB) {
                $scope.hideTable = true;
                var myDB = window.sqlitePlugin.openDatabase({ name: "test.db", location: 'default' });
                myDB.transaction(function (transaction) {
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS expenses_angjs (id integer primary key , reason text , amount text)', [],
                        function (tx, result) {
                        },
                        function (error) {
                            alert("Error occurred  while creating the table");
                        });
                });
                myDB.transaction(function (transaction) {
                    transaction.executeSql('INSERT INTO expenses_angjs (reason,amount) VALUES (?,?)', [reasonDB, amountspentDB],
                        function (tx, result) {
                            alert('List Created, Click on LoadData button to see the list');
                        },
                        function (error) {
                            alert("Failed to insert data");
                        });
                });
            }
            else {
                alert("Please select/Enter the reason");
            }
        }
        else {
            $scope.amount = originalAmount;
            alert("Please enter the valid amount as amount spent is greater than the Actual Amount");
        }
    }

    var refreshCount = 0;
    $scope.Load = function () {
        $scope.hideButtons = false;
        if (refreshCount == 0) {
            var myDB = window.sqlitePlugin.openDatabase({ name: "test.db", location: 'default' });
            myDB.transaction(function (transaction) {
                alert("Loading the data");
                transaction.executeSql('SELECT * FROM expenses_angjs', [],
                    function (tx, result) {
                        var rowCount = result.rows.length;
                        for (var i = 0; i < rowCount; ++i) {
                            $scope.record.push({
                                id: result.rows.item(i).id,
                                reason: result.rows.item(i).reason,
                                amount: result.rows.item(i).amount
                            });
                        }
                    },
                    function (error) {
                        alert("Failed to Show the List");
                    });
                alert("Click on Display button to get the data");
            });
            refreshCount++;
        }
        else {
            var myDB = window.sqlitePlugin.openDatabase({ name: "test.db", location: 'default' });
            myDB.transaction(function (transaction) {
                alert("Loading the data");
                transaction.executeSql('SELECT * FROM expenses_angjs', [],
                    function (tx, result) {
                        var rowCount = result.rows.length;
                        for (var i = refreshCount; i < rowCount; ++i) {
                            $scope.record.push({
                                id: result.rows.item(i).id,
                                reason: result.rows.item(i).reason,
                                amount: result.rows.item(i).amount
                            });
                        }
                    },
                    function (error) {
                        alert("Failed to Show the List");
                    });
                alert("Click on Display button to get the data");
            });
        }
    }

    $scope.display = function () {
        $scope.hideTable = false;
    }

    $scope.createNew = function () {
        $scope.hideButtons = true;
        var confirmField = confirm("All the data will be lost,Are you sure?");
        if (confirmField == true) {
            window.location.reload(true);
        }
        else {
        }
    }

    $scope.deleteRow = function (deleteRow) {
        var deleteConfirm = confirm("Sure to delete?");
        if (deleteConfirm == true) {
            var deletedAmount = Number(deleteRow.amount);
            $scope.amount = $scope.amount + deletedAmount;
            $scope.record.splice($scope.record.indexOf(deleteRow), 1);
            var myDB = window.sqlitePlugin.openDatabase({ name: "test.db", location: "default" });
            myDB.transaction(function (transaction) {
                transaction.executeSql('DELETE FROM expenses_angjs WHERE ID=?', [deleteRow.id], function (tx, result) {
                    alert("Successfully deleted");
                },
                    function (error) {
                        alert("Failed to delete");
                    });
            });
        }
        else { }
    }

});
