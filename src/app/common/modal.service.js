(function() {
    'use strict';
    angular.module('neograph.common.modal',[])
      .provider('modal', modalProvider)
      .directive('modalClose', modalClose)
      .directive('modalOpen', modalOpen);

    /* @ngInject */
    function modalProvider() {
        /* jshint validthis:true */

        var _map = {};
        var current;
        var passedData;
        var service = {
            open: modalOpen,
            close: modalClose,
            add: modalAdd,
            getData: getData
        };
        var bootstrapModal;

        /* @ngInject */
        this.$get = function($uibModal) {
            bootstrapModal = $uibModal;
            return service;
        };

        this.add = modalAdd;

        function modalAdd(name, obj) {
            if (_map[name]) {
                throw new Error(name, 'already existing');
            }
            _map[name] = {};
            _map[name].config = obj;
            return this;
        }

        function getData(name) {
            name = name || current;
            if (!_map[name]) {
                return null;
            }
            return passedData;
        }

        function modalOpen(name, data) {
            if (!_map[name]) {
                return false;
            }
            current = name;
            passedData = data;
            _map[name].instance = bootstrapModal.open(_map[name].config);
            return _map[name].instance.result;
        }

        function modalClose(name, result) {
            name = name || current;
            if (!_map[name] || !_map[name].instance) {
                return false;
            }
            _map[name].instance.close(result);
            current = null;
            passedData = null;
            delete _map[name].instance;
            return true;
        }
    }
    /* @ngInject */
    function modalClose(modal) {
        return {
            scope: false,
            restrict: 'A',
            controller: function ($scope, $element, $attrs) {
                $element.bind('click', function() {
                    var name = $attrs.modalClose;
                    var reason = $attrs.dismiss;
                    modal.close(name, reason);
                });
            }
        };
    }
    /* @ngInject */
    function modalOpen(modal) {
        return {
            scope: false,
            restrict: 'A',
            controller: function ($scope, $element, $attrs) {
                $element.bind('click', function() {
                    var name = $attrs['modalOpen'];
                    modal.open(name);
                });
            }
        };
    }

}());
