"use strict";
var KTDatatablesBasicPaginations = function() {

	var initTable1 = function() {
		var table = $('#kt_table_1');

		// begin first table
		// https://datatables.net/extensions/buttons/examples/html5/columns.html
		table.DataTable({
			dom: 'Bfrtip',
			buttons: [
				'colvis',
				{
					extend: 'copyHtml5',
					title: 'COP',
					messageTop: 'RALLIES AND CONVENTIONS',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] //[ 0, ':visible' ]
					}
				},
				{
					filename: 'COP_cr_csv',
					extend: 'csv',
					title: 'COP',
					messageTop: 'RALLIES AND CONVENTIONS',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] //[0, ':visible']
					}
				},
				{
					filename: 'COP_cr_excel',
					extend: 'excelHtml5',
					title: 'COP',
					messageTop: 'RALLIES AND CONVENTIONS',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] //[0, ':visible']
					}
				},
				{
					filename: 'COP_cr_pdf',
					extend: 'pdfHtml5',
					title: 'COP',
					messageTop: 'RALLIES AND CONVENTIONS',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] //[0, ':visible']
					}
				},
				{
					filename: 'COP_cr_print',
					extend: 'print',
					title: 'COP',
					messageTop: 'RALLIES AND CONVENTIONS',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] //[0, ':visible']
					}
				}
			],
			responsive: true,
			pagingType: 'full_numbers',
			columnDefs: [
				{
					targets: -1,
					title: 'Actions',
					orderable: false,
					render: function(data, type, full, meta) {
						return `
                        <span class="dropdown">
                            <a onclick="printRowData(this.parentElement.parentElement.parentElement)" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true" title="Print">
                              <i class="la la-print"></i>
                            </a>
                        </span>
                        <a onclick="viewRowData(this.parentElement.parentElement)" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="View">
                          <i class="fa flaticon-search-magnifier-interface-symbol"></i>
                        </a>`;
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

// print the row data
let printRowData = (row) => {
	let col_ids = ["cr_id", "cr_type", "cr_title", "start_date_time", "end_date_time", "venue", "assembly", "souls_won", "head_count", "mode_of_count"];
	let jsonData = {};
	let row_data = row.getElementsByTagName("td");
	for (let i = 0; i < row_data.length - 1; i++) {
		jsonData[col_ids[i]] = row_data[i].textContent;
	}
	printDetails(jsonData);
}

//Method to load row back into form
let viewRowData = (row) => {
	let colIds = ["cr_id", "cr_type", "cr_title", "start_date_time", "end_date_time", "venue", "assembly", "souls_won", "head_count", "mode_of_count"];
	let rowData = row.getElementsByTagName("td");
	let jsonRowData = {}

	for (let i = 0; i < rowData.length - 1; i++ ){
		jsonRowData[colIds[i]] = rowData[i].textContent;
	}

	$("#cr_id_div").attr("hidden", false);

	//console.log(jsonRowData);
	document.querySelector("#cr_id").value = jsonRowData.cr_id;
	document.querySelector("#cr_type").value = jsonRowData.cr_type;
	document.querySelector("#cr_title").value = jsonRowData.cr_title;
	document.querySelector("#kt_datetimepicker_1").value = jsonRowData.start_date_time;
	document.querySelector("#kt_datetimepicker_2").value = jsonRowData.end_date_time;
	document.querySelector("#venue").value = jsonRowData.venue;
	document.querySelector("#assembly").value = jsonRowData.assembly;
	document.querySelector("#souls_won").value = jsonRowData.souls_won;
	document.querySelector("#head_count").value = jsonRowData.head_count;
	document.querySelector("#mode_of_count").value = jsonRowData.mode_of_count;

	KTUtil.scrollTop();
};

$("#cancel_rc_btn").on("click", function(e) {
	$("#cr_id_div").attr("hidden", true);	
});

// submit the rallies and conventions form
// $('#submit_rc_btn').click(function(e) {
// 	e.preventDefault();

// 	$.ajax({
// 		url: "rallies_and_conventions",
// 		method: "POST",
// 		success: 
// 	});
// });

// Class definition
var KTForm = function () {
    // Base elements
    var formEl;
    var validator;

    var initValidation = function() {
        validator = formEl.validate({
            // Validate only visible fields
            ignore: ":hidden",

            // Validation rules
            rules: {
               	//= Step 1
				rc_type: {
					required: true 
				},
				kt_datetimepicker_1: {
					required: true
				},	   
				kt_datetimepicker_2: {
					required: true
				},	 
				assembly: {
					required: true
				},	 
				venue: {
					required: true
				},
				souls_won: {
					required: true
				},
				head_count: {
					required: true
				},
				mode_of_count: {
					required: true
				}
                 
            },
            
            // Display error  
            invalidHandler: function(event, validator) {     
                KTUtil.scrollTop();

                swal.fire({
                    "title": "", 
                    "text": "Your form is incomplete, Please complete it!", 
                    "type": "error",
                    "confirmButtonClass": "btn btn-secondary"
                });
            },

            // Submit valid form
            submitHandler: function (form) {
                
            }
        });   
    }

    var initSubmit = function() {
        var btn = formEl.find('[id="submit_rc_btn"]');

        btn.on('click', function(e) {
            e.preventDefault();

            if (validator.form()) {
                // See: src\js\framework\base\app.js
                KTApp.progress(btn);
                //KTApp.block(formEl);

                // See: http://malsup.com/jquery/form/#ajaxSubmit
                formEl.ajaxSubmit({

                    url: "/rallies_and_conventions_submit",

                    error: function(res, err) {
                        KTApp.unprogress(btn);
            
                        swal.fire({
                            "title": "",
                            "text": res.responseJSON.message, 
                            "type": "error",
                            "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
                        });
                    },

                    success: function(res) {
                        KTApp.unprogress(btn);
                        //KTApp.unblock(formEl);

                        swal.fire({
                            "title": "", 
                            "text": "The data has been successfully submitted!", 
                            "type": "success",
							"showCancelButton": true,
							"confirmButtonText": 'Print',
							"confirmButtonClass": "btn btn-primary",
							"cancelButtonText": 'Continue',
							"cancelButtonClass": 'btn btn-success',
							"reverseButtons": true
						}).then((result) => {
							if (result.value) {
								// print the member's details
								printDetails(res);
								// reset the form
								location.href = "rallies_and_conventions";
							} else {
								// reset the form
								location.href = "rallies_and_conventions";
							}
                        });
                    }
                });
            }
        });
    }

    return {
        // public functions
        init: function() {
			formEl = $('#rc_form');
			
            initValidation();
            initSubmit();
        }
    };
}();

jQuery(document).ready(function() {    
    KTForm.init();
});

// print the user's details
let printDetails =  (data) => {
	// open the print window
	var print_area = window.open();
	// compose the document
	print_area.document.write("<html><head><title>User Details</title>"
								+ "<style>.kt-wizard-v1__review-content {font-size: 20;}"
								+ "</style></head>"
								+ "<body style=\"padding: 20px;\">" 
								+ "<h1 style=\"text-align: center; font-weight: bold;\">COP</h1><br><br>"
								+ "<h1 style=\"text-align: center; font-weight: bold;\">RALLIES AND CONVENTIONS</h1>"
								+ '<div class="kt-wizard-v1__review-content">'
								+ 'ID: <label>' + data.cr_id + '</label>'
								+ '<br/>Type: <label>' + data.cr_type + '</label>'
								+ '<br/>Title: <label>' + data.cr_title + '</label>'
								+ '<br/>Start Date: <label>' + data.start_date_time + '</label>'
								+ '<br/>End Date: <label>' + data.end_date_time + '</label>'
								+ '<br/>Assembly: <label>' + data.assembly + '</label>'
								+ '<br/>Venue: <label>' + data.venue + '</label>'
								+ '<br/>Souls Won: <label>' + data.souls_won + '</label>'
								+ '<br/>Head Count: <label>' + data.head_count + '</label>'
								+ '<br/>Mode of Count: <label>' + data.mode_of_count + '</label>'
								+ "</div></body></html>");
	let cssPaths = ["/static/assets/css/demo2/pages/general/wizard/wizard-1.css",
					"/static/assets/vendors/global/vendors.bundle.css",
					"/static/assets/css/demo2/style.bundle.css"];

	for (let i = 0; i < cssPaths.length; i++) {
		let style = print_area.document.createElement('link');
		style.type = "text/css";
		style.rel = "stylesheet";
		style.href = location.origin + cssPaths[i];
		style.media = "all";
		print_area.document.getElementsByTagName("head")[0].appendChild(style);
	}
	// print details and return to page
	print_area.document.close();
	print_area.focus();
	print_area.print();
	print_area.close();
  }

// print table
// https://jasonday.github.io/printThis/
// $('#download_table_btn').on("click", function () {
// 	$('#kt_table_1').printThis({
// 		importCSS: true,
// 		importStyle: true,
// 		pageTitle: "COP-KAD",
// 		loadCSS: ["/static/assets/css/demo2/pages/general/wizard/wizard-1.css",
// 		"/static/assets/vendors/global/vendors.bundle.css",
// 		"/static/assets/css/demo2/style.bundle.css"],
// 		header: "<h1>Rallies and Conventions</h1>",
// 		base: location.host
// 	});
// });

// compare dates: g means date1 greater than date2, l means date1 less than date2 and date1 equal to date2
let compareDates = (date1, date2) => {
	if (date1 > date2) return ("g");
	else if (date1 < date2) return ("l");
	else return ("e"); 
}


// search by date
// https://keenthemes.com/metronic/?page=docs&section=html-components-datatable
var tableData = -1;  // keep the full table content
$("#kt_dashboard_daterangepicker").on("apply.daterangepicker", function(e, picker) {
	// let picker = document.querySelector("#kt_dashboard_daterangepicker");
	// var startDate = $(this).data('daterangepicker').startDate._d;
	// var endDate = $(this).data('daterangepicker').endDate._d;
	let startDate = new Date(picker.startDate.format('YYYY-MM-DD'));
	let endDate = new Date(picker.endDate.format('YYYY-MM-DD'));
	let datatable = $("#kt_table_1").DataTable();
	// if the table data is not set, set it
	// else reload the table data
	if(tableData === -1) {
		tableData = Object.assign({}, datatable.table().data());
	} else {
		datatable.clear();
		datatable.rows.add(tableData);
		datatable.draw(false);
	}
	let tableRowsLength = datatable.rows()[0].length;
	// handle equal dates and if startDate is less than endDate
	let datesComp = compareDates(startDate, endDate);
	if(datesComp === "e") {
		for(let i = 0; i < tableRowsLength; i++) {
			let tr_data = datatable.row(i).data();
			let sDate = new Date(tr_data[3].split(" ")[0]);
			let eDate = new Date(tr_data[4].split(" ")[0]);
			if (compareDates(sDate, startDate) === "e" && compareDates(sDate, endDate) === "e" && compareDates(eDate, startDate) === "e" && compareDates(eDate, endDate) === "e") {
				continue;
			}
			datatable.row(i).remove().draw(false);
			i--;
			tableRowsLength--;
		}
	} else if(datesComp === "l") {
		for(let i = 0; i < tableRowsLength; i++) {
			let tr_data = datatable.row(i).data();
			let sDate = new Date(tr_data[3].split(" ")[0]);
			let eDate = new Date(tr_data[4].split(" ")[0]);
			if ((sDate >= startDate && sDate <= endDate) || (eDate >= startDate && eDate <= endDate)) {
				continue;
			}
			datatable.row(i).remove().draw(false);
			i--;
			tableRowsLength--;
		}
	} else {
		swal.fire({
			"title": "",
			"text": "Invalid date range", 
			"type": "error",
			"confirmButtonClass": "btn btn-brand btn-sm btn-bold"
		});
	}
});