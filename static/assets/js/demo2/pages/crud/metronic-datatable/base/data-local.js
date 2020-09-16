'use strict';
// Class definition

var KTDatatableDataLocalDemo = function() {
	// Private functions

	// demo initializer
		// demo initializer
		var demo = function() {
			var dataJSONArray = JSON.parse('[{"MemberID":1,"OrderID":"0374-5070","Country":"China","ShipCountry":"CN","ShipCity":"Jiujie","ShipName":"Rempel Inc","ShipAddress":"60310 Schiller Center","CompanyEmail":"cdodman0@wsj.com","CompanyAgent":"Cordi Dodman","CompanyName":"Kris-Wehner","Currency":"CNY","Notes":"sed vel enim sit amet nunc viverra dapibus nulla suscipit ligula in lacus curabitur at ipsum ac tellus","Department":"Kids","Website":"tripadvisor.com","Latitude":39.952319,"Longitude":119.598195,"ShipDate":"8/27/2017","PaymentDate":"2016-09-15 22:18:06","TimeZone":"Asia/Chongqing","TotalPayment":"$336309.10","Status":6,"Type":2,"Actions":null},\n' +
				
				'{"RecordID":100,"OrderID":"50865-056","Country":"Honduras","ShipCountry":"HN","ShipCity":"Yuscarán","ShipName":"Anderson, Pfannerstill and Miller","ShipAddress":"116 Bay Way","CompanyEmail":"hensley2r@businessweek.com","CompanyAgent":"Hamil Ensley","CompanyName":"Kessler, Greenfelder and Gaylord","Currency":"HNL","Notes":"nulla ac enim in tempor turpis nec euismod scelerisque quam turpis adipiscing lorem vitae mattis","Department":"Kids","Website":"dell.com","Latitude":13.9448964,"Longitude":-86.8508942,"ShipDate":"1/14/2016","PaymentDate":"2016-12-27 22:25:10","TimeZone":"America/Tegucigalpa","TotalPayment":"$386091.31","Status":6,"Type":3,"Actions":null}]');
	
		var datatable = $('.kt-datatable').KTDatatable({
			// datasource definition
			data: {
				type: 'local',
				source: dataJSONArray,
				pageSize: 10,
			},

			// layout definition
			layout: {
				scroll: false, // enable/disable datatable scroll both horizontal and vertical when needed.
				// height: 450, // datatable's body's fixed height
				footer: false, // display/hide footer
			},

			// column sorting
			sortable: true,

			pagination: true,

			search: {
				input: $('#generalSearch'),
			},

			// columns definition
			columns: [
				{
					field: 'RecordID',
					title: '#',
					sortable: false,
					width: 20,
					type: 'number',
					selector: {class: 'kt-checkbox--solid'},
					textAlign: 'center',
				}, {
					field: 'OrderID',
					title: 'OrderID',
				}, {
					field: 'Full Name',
					title: 'Full Name',
					template: function(row) {
						return row.Country + ' ' + row.ShipCountry;
					},
				}, {
					field: 'RegistrationDate',
					title: 'RegistrationDate',
					type: 'date',
					format: 'MM/DD/YYYY',
				}, {
					field: 'Assembly',
					title: 'Assembly',
				}, {
					field: 'Verification Status',
					title: 'Verification Status',
					// callback function support for column rendering
					template: function(row) {
						var status = {
							1: {'title': 'Verified', 'class': 'kt-badge--success'},
							2: {'title': 'Pending', 'class': ' kt-badge--primary'},
							3: {'title': 'Rejected', 'class': ' kt-badge--danger'},
							4: {'title': 'Verified', 'class': ' kt-badge--success'},
							5: {'title': 'Pending', 'class': ' kt-badge--primary'},
							6: {'title': 'Rejected', 'class': ' kt-badge--danger'},
							7: {'title': 'Verified', 'class': ' kt-badge--success'},
						};
						return '<span class="kt-badge ' + status[row.Status].class + ' kt-badge--inline kt-badge--pill">' + status[row.Status].title + '</span>';
					},
				}, {
					field: 'Accessibility',
					title: 'Accessibility',
					autoHide: false,
					// callback function support for column rendering
					template: function(row) {
						var status = {
							1: {'title': 'Administrator', 'state': 'danger'},
							2: {'title': 'Accounts', 'state': 'primary'},
							3: {'title': 'Finance', 'state': 'success'},
							4: {'title': 'Member','state':'info'}
						};
						return '<span class="kt-badge kt-badge--' + status[row.Type].state + ' kt-badge--dot"></span>&nbsp;<span class="kt-font-bold kt-font-' + status[row.Type].state +
							'">' +
							status[row.Type].title + '</span>';
					},
				}, {
					field: 'Actions',
					title: 'Actions',
					sortable: false,
					width: 110,
					overflow: 'visible',
					autoHide: false,
					template: function() {
						return '\
						<div class="dropdown">\
							<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown">\
                                <i class="la la-cog"></i>\
                            </a>\
						  	<div class="dropdown-menu dropdown-menu-right">\
						    	<a class="dropdown-item" href="#"><i class="fa fa-fingerprint"></i> Biometric verification</a>\
						    	<a class="dropdown-item" href="#"><i class="fa fa-eye"></i> Facial Recognition</a>\
						    	<a class="dropdown-item" href="#"><i class="la la-print"></i> Generate Report</a>\
						  	</div>\
						</div>\
						<a href="add-user.html" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Edit details">\
							<i class="la la-edit"></i>\
						</a>\
						<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Delete">\
							<i class="la la-trash"></i>\
						</a>\
					';
					},
				}],
		});

		$('#kt_form_status').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'Status');
		});

		$('#kt_form_type').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'Type');
		});

		$('#kt_form_status,#kt_form_type').selectpicker();

	};

	return {
		// Public functions
		init: function() {
			// init dmeo
			demo();
		},
	};
}();

jQuery(document).ready(function() {
	KTDatatableDataLocalDemo.init();
});