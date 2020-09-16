"use strict";
var KTDatatablesBasicPaginations = function() {

	var initTable1 = function() {
		var table = $('#kt_table_1');

		// begin first table
		table.DataTable({
			dom: 'Bfrtip',
			buttons: [
				'colvis',
				{
					extend: 'copyHtml5',
					title: 'COP',
					messageTop: 'DEDICATION',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8] //[ 0, ':visible' ]
					}
				},
				{
					filename: 'COP_ded_csv',
					extend: 'csv',
					title: 'COP',
					messageTop: 'DEDICATION',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8] //[0, ':visible']
					}
				},
				{
					filename: 'COP_ded_excel',
					extend: 'excelHtml5',
					title: 'COP',
					messageTop: 'DEDICATION',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8] //[0, ':visible']
					}
				},
				{
					filename: 'COP_ded_pdf',
					extend: 'pdfHtml5',
					title: 'COP',
					messageTop: 'DEDICATION',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8] //[0, ':visible']
					}
				},
				{
					filename: 'COP_ded_print',
					extend: 'print',
					title: 'COP',
					messageTop: 'DEDICATION',
					messageBottom: 'END OF DOCUMENT',
					exportOptions: {
						columns: [0, 1, 2, 3, 4, 5, 6, 7, 8] //[0, ':visible']
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
                            <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                              <i class="la la-ellipsis-h"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#kt_modal_4"><i class="fa flaticon2-email"></i> Push Notification</a>
                                <a class="dropdown-item" href="#"><i class="la la-print"></i> Generate Report</a>
                            </div>
                        </span>
                        <a onclick="viewRowData(this.parentElement.parentElement)" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="View">
                          <i class="fa flaticon-search-magnifier-interface-symbol"></i>
                        </a>`;
					},
				},
				{
					targets: 7,
					render: function(data, type, full, meta) {

						var assembly = {
							EEA: {'title': 'Emmanuel'},
							GA: {'title': 'Glory'},
							HA: {'title': 'Hope'}
						}
						
						if(typeof assembly[data] === 'undefined') {
							return data;
						}

						return assembly[data].title;
					}
				},
				// {
				// 	targets: 9,
				// 	render: function(data, type, full, meta) {
				// 		var status = {
				// 			1: {'title': 'Verified', 'state': 'success'},
				// 			2: {'title': 'Not Verified', 'state': 'primary'},
				// 		};
				// 		if (typeof status[data] === 'undefined') {
				// 			return data;
				// 		}
				// 		return '<span class="kt-badge kt-badge--' + status[data].state + ' kt-badge--dot"></span>&nbsp;' +
				// 			'<span class="kt-font-bold kt-font-' + status[data].state + '">' + status[data].title + '</span>';
				// 	},
				// },
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

// allow the select option to be clearable
let resetSelect2 = () => {
	$("#kt_select2_3").select2('data', {}); // clear out values selected
	$("#kt_select2_3").select2({ allowClear: true }); // re-init to show default status
}

// load the row data into the form for viewing and updating
let viewRowData = (row) => {
	let colIds = ["record_id", "member_id_mother", "member_id_father", "name_of_child", "child_dob", "date_of_dedication", "officiating_minister", "assembly", "place_of_ceremony"];
	let rowData = row.getElementsByTagName("td");
	let jsonRowData = {};

	for(let i = 0; i < rowData.length - 1; i++) {
		jsonRowData[colIds[i]] = rowData[i].textContent;
	}

	$("#dedication_form")[0].reset();

	$("#record_id_div").attr("hidden", false);

	//console.log(jsonRowData);
	document.querySelector("#record_id").value = jsonRowData.record_id;
	document.querySelector("#member_id_mother").value = jsonRowData.member_id_mother;
	document.querySelector("#member_id_father").value = jsonRowData.member_id_father;
	document.querySelector("#child_name").value = jsonRowData.name_of_child;
	document.querySelector("#child_dob").value = jsonRowData.child_dob.split(" ")[0];
	document.querySelector("#kt_datetimepicker_2").value = jsonRowData.date_of_dedication;
	document.querySelector("#officiating_minister").value = jsonRowData.officiating_minister;
	let assemblies = {
		"Emmanuel": "EEA",
		"Glory": "GA",
		"Hope": "HA"
	};
	document.querySelector("#kt_select2_3").value = assemblies[jsonRowData.assembly];
	$("#kt_select2_3").trigger("change");
	document.querySelector("#place_of_ceremony").value = jsonRowData.place_of_ceremony;

	KTUtil.scrollTop();

	$("#member_id_father").trigger("change");
	$("#member_id_mother").trigger("change");
}


$("#reset_dedication_btn").on("click", function(e) {
	$("#record_id_div").attr("hidden", true);
});


$("#member_id_father").on("keyup", function(e) {
	if ($(this).val().length === 8) {
		$("#find_father_id").attr("hidden", false);		
        $.ajax({
            method: "POST",
            url: "/load_user_by_id/member_id_father",
            data: $(this).serialize()
        }).done(function(res) {
			$("#find_father_id").attr("hidden", true);
			if(res.gender==="M"){
				if (res.first_name) {
					let img_url = "/" + res.img;
					$('#modal_father_image').attr("src", img_url);
					let fullName = res.last_name + ", " + res.first_name
					if (res.other_names) {
						fullName = fullName + " " + res.other_names;
					}
					document.querySelector("#modal_father_name").textContent = fullName;
					document.querySelector("#father_name").value = fullName;
					let assemblies = {
						EEA: "Emmanuel English Assembly",
						GA: "Glory Assembly",
						HA: "Hope Assembly"
					}
					document.querySelector("#modal_father_assembly").textContent = assemblies[res.assembly];
					//document.querySelector("#modal_father_id").textContent = res.member_id;
				} else {
					let img_url = "/static/assets/media/users/thecopkadna-users.png";
					$("#find_father_id").attr("hidden", true);
					$('#modal_father_image').attr("src", img_url);
					document.querySelector("#father_name").value = "";
					document.querySelector("#modal_father_name").textContent = "";
					//document.querySelector("#modal_father_id").textContent = "";
					document.querySelector("#modal_father_assembly").textContent = "";
					swal.fire({
						"title": "", 
						"text": "Father ID Not Found!", 
						"type": "error",
						"confirmButtonClass": "btn btn-secondary"
					});
					
				}
			} else {
				let img_url = "/static/assets/media/users/thecopkadna-users.png";
				$("#find_father_id").attr("hidden", true);
				$('#modal_father_image').attr("src", img_url);
				document.querySelector("#father_name").value = "";
				document.querySelector("#modal_father_name").textContent = "ID must belong to a male member";
				//document.querySelector("#modal_father_id").textContent = "";
				document.querySelector("#modal_father_assembly").textContent = "";
			}
        });
    } else {
		let img_url = "/static/assets/media/users/thecopkadna-users.png";
		$("#find_father_id").attr("hidden", true);
        $('#modal_father_image').attr("src", img_url);
		document.querySelector("#father_name").value = "";
		document.querySelector("#modal_father_name").textContent = "";
        //document.querySelector("#modal_father_id").textContent = "";
        document.querySelector("#modal_father_assembly").textContent = "";
    }
});

// search for mother's data when member id field value length is 8
$("#member_id_mother").on("keyup", function(e) {
    if ($(this).val().length === 8) {
		$("#find_mother_id").attr("hidden", false);
        $.ajax({
            method: "POST",
            url: "/load_user_by_id/member_id_mother",
            data: $(this).serialize()
        }).done(function(res) {
			$("#find_mother_id").attr("hidden", true);
			if(res.gender === "F"){
				if (res.first_name) {
					let img_url = "/" + res.img;
					$('#modal_mother_image').attr("src", img_url);
					let fullName = res.last_name + ", " + res.first_name
					if (res.other_names) {
						fullName = fullName + " " + res.other_names;
					}
					document.querySelector("#modal_mother_name").textContent = fullName;
					document.querySelector("#mother_name").value = fullName;
					let assemblies = {
						EEA: "Emmanuel English Assembly",
						GA: "Glory Assembly",
						HA: "Hope Assembly"
					}
					document.querySelector("#modal_mother_assembly").textContent = assemblies[res.assembly];
					//document.querySelector("#modal_mother_id").textContent = res.member_id;
				} else {
					$("#find_mother_id").attr("hidden", true);
					let img_url = "/static/assets/media/users/thecopkadna-users.png";
					$('#modal_mother_image').attr("src", img_url);
					document.querySelector("#mother_name").value = "";
					document.querySelector("#modal_mother_name").textContent = "";
					//document.querySelector("#modal_mother_id").textContent = "";
					document.querySelector("#modal_mother_assembly").textContent = "";
					swal.fire({
						"title": "", 
						"text": "Mother ID Not Found!", 
						"type": "error",
						"confirmButtonClass": "btn btn-secondary"
					});
				}
			}else{
				$("#find_mother_id").attr("hidden", true);
				let img_url = "/static/assets/media/users/thecopkadna-users.png";
				$('#modal_mother_image').attr("src", img_url);
				document.querySelector("#mother_name").value = "";
				document.querySelector("#modal_mother_name").textContent = "ID must belong to a female member";
				//document.querySelector("#modal_mother_id").textContent = "";
				document.querySelector("#modal_mother_assembly").textContent = "";
			}
            
        });
    } else {
		$("#find_mother_id").attr("hidden", true);
        let img_url = "/static/assets/media/users/thecopkadna-users.png";
        $('#modal_mother_image').attr("src", img_url);
		document.querySelector("#mother_name").value = "";
		document.querySelector("#modal_mother_name").textContent = "";
        //document.querySelector("#modal_mother_id").textContent = "";
        document.querySelector("#modal_mother_assembly").textContent = "";
    }
});

$("#member_id_father").on("change", function(e){
	e.preventDefault();
	$("#member_id_father").trigger("keyup");
});

$("#member_id_mother").on("change", function(e){
	e.preventDefault();
	$("#member_id_mother").trigger("keyup");
});

// Class definition
var KTForm = function () {
    // Base elements
    var formEl;
    var validator;

	let momOrDad = () => {
		if (document.querySelector("#father_name").value || document.querySelector("#mother_name").value){
			return true;
		}
		else{
			return false;
		}
	};

    var initValidation = function() {
		
        validator = formEl.validate({
            // Validate only visible fields
            ignore: ":hidden",

			// Validation rules
            rules: {
               	//= Step 1
				kt_select2_3: {
					required: true
				},   
				kt_datetimepicker_2: {
					required: true
				},	 
				child_name: {
					required: true
				},	 
				child_dob: {
					required: true
				},
				officiating_minister: {
					required: true
				},
				place_of_ceremony: {
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
        var btn = formEl.find('[id="submit_dedication_btn"]');

        btn.on('click', function(e) {
            e.preventDefault();

            if (validator.form() && momOrDad()) {
                // See: src\js\framework\base\app.js
                KTApp.progress(btn);
                //KTApp.block(formEl);

                // See: http://malsup.com/jquery/form/#ajaxSubmit
                formEl.ajaxSubmit({

                    url: "/dedication_submit",

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
								location.href = "dedication";
							} else {
								// reset the form
								location.href = "dedication";
							}
                        });
                    }
                });
            } else {
				KTUtil.scrollTop();

                swal.fire({
                    "title": "", 
                    "text": "Your form is incomplete, Please complete it!", 
                    "type": "error",
                    "confirmButtonClass": "btn btn-secondary"
                });
			}
        });
    }

    return {
        // public functions
        init: function() {
			formEl = $('#dedication_form');
			
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
								+ "<h1 style=\"text-align: center; font-weight: bold;\">DEDICATION</h1>"
								+ '<div class="kt-wizard-v1__review-content">'
								+ 'Member ID of Father: <label>' + data.member_id_father + '</label>'
								+ '<br/>Member ID of Mother: <label>' + data.member_id_mother + '</label>'
								+ '<br/>Child Name: <label>' + data.child_name + '</label>'
								+ '<br/>Child Date of Birth: <label>' + data.child_dob + '</label>'
								+ '<br/>Date of Dedication: <label>' + data.dedication_date_time + '</label>'
								+ '<br/>Officiating Minister: <label>' + data.officiating_minister + '</label>'
								+ '<br/>Assembly: <label>' + data.assembly + '</label>'
								+ '<br/>Place of Ceremony: <label>' + data.place_of_ceremony + '</label>'
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
			let sDate = new Date(tr_data[5].split(" ")[0]);
			if (compareDates(sDate, startDate) === "e" && compareDates(sDate, endDate) === "e") {
				continue;
			}
			datatable.row(i).remove().draw(false);
			i--;
			tableRowsLength--;
		}
	} else if(datesComp === "l") {
		for(let i = 0; i < tableRowsLength; i++) {
			let tr_data = datatable.row(i).data();
			let sDate = new Date(tr_data[5].split(" ")[0]);
			if (sDate >= startDate && sDate <= endDate) {
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
			let sDate = new Date(tr_data[4].split(" ")[0]);
			let eDate = new Date(tr_data[5].split(" ")[0]);
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
			let sDate = new Date(tr_data[4].split(" ")[0]);
			let eDate = new Date(tr_data[5].split(" ")[0]);
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