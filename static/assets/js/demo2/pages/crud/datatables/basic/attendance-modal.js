"use strict";
var KTDatatablesBasicPaginations = function() {

	var initTable1 = function() {
		var table = $('#kt_table_1');

		// begin first table
		table.DataTable({
			responsive: true,
			pagingType: 'full_numbers',
			columnDefs: [
				
				
				{
					targets: 8,
					render: function(data, type, full, meta) {
						var status = {
							1: {'title': 'Active', 'class': 'kt-badge--success'},
							2: {'title': 'Inactive', 'class': ' kt-badge--warning'},
							3: {'title': 'Backslider', 'class': ' kt-badge--danger'},
						};
						if (typeof status[data] === 'undefined') {
							return data;
						}
						return '<span class="kt-badge ' + status[data].class + ' kt-badge--inline kt-badge--pill">' + status[data].title + '</span>';
					},
				},
			],
		});
	};

	return {

		//main function to initiate the module
		init: function() {
			initTable1();
		},

	};

}();

jQuery(document).ready(function() {
	KTDatatablesBasicPaginations.init();
});