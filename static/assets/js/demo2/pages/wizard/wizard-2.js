"use strict";

// Class definition
var KTWizard2 = function () {
    // Base elements
    var wizardEl;
    var formEl;
    var validator;
    var wizard;
    
    // Private functions
    var initWizard = function () {
        // Initialize form wizard
        wizard = new KTWizard('kt_wizard_v2', {
            startStep: 1,
        });

        // Validation before going to next page
        wizard.on('beforeNext', function(wizardObj) {
            if (validator.form() !== true) {
                wizardObj.stop();  // don't go to the next step
            }
        })

        // Change event
        wizard.on('change', function(wizard) {
            KTUtil.scrollTop();  
            reviewBaptismDetails();  
        });
    }

    var initValidation = function() {
        validator = formEl.validate({
            // Validate only visible fields
            ignore: ":hidden",

            // Validation rules
            rules: {
               	//= Step 1
				first_name: {
					required: true 
				},
				assembly: {
					required: true
				},	   
				contacts: {
					required: true
				},	 
				email: {
					required: false,
					email: true
				},	 

				//= Step 2
				date_of_baptism: {
					required: true 
				},
				place_of_baptism: {
					required: true
				},	   
				officiating_minister: {
					required: true
                },	
                area: {
                    required: true
                },
                district: {
                    required: true
                },
				country: {
					required: true
                },	 	  
                 
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
        var btn = formEl.find('[data-ktwizard-type="action-submit"]');

        btn.on('click', function(e) {
            e.preventDefault();

            if (validator.form()) {
                // See: src\js\framework\base\app.js
                KTApp.progress(btn);
                //KTApp.block(formEl);

                // See: http://malsup.com/jquery/form/#ajaxSubmit
                formEl.ajaxSubmit({

                    url: "/baptism_certificates_submit",

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
								printDetails("review_and_submit_div", res.member_id);
								// reset the form
								location.href = "baptism_certificates";
							} else {
								// reset the form
								location.href = "baptism_certificates";
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
            wizardEl = KTUtil.get('kt_wizard_v2');
            formEl = $('#kt_form');

            initWizard(); 
            initValidation();
            initSubmit();
        }
    };
}();

jQuery(document).ready(function() {    
    KTWizard2.init();
});

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode >= 48 && charCode <= 57) {
        return true;
    }
    return false;
}

let reviewBaptismDetails = () => {
    let ids_to_take = ["full_name", "contacts", "email", "assembly", "district", "area", 
    "date_of_baptism", "place_of_baptism", "officiating_minister"];

    let ids_to_fill = ["review_name", "review_contact", "review_email", "review_assembly", 
    "review_district", "review_area", "review_date_of_baptism", "review_place_of_baptism", "review_off_minister"];

    let val;
    let values = [];

    for(let i=0; i < ids_to_take.length; i++){
        let id = ids_to_take[i];
	  	val = document.querySelector("#" + id).value;
        values.push(val);
    }

    for (let i=0; i < ids_to_fill.length; i++){
        let id = ids_to_fill[i];
        document.querySelector("#"+id).textContent = values[i];
    }
    
}


// search for user's data when member id field value length is 8
$("#member_id").on("keyup", function(e) {

    if ($(this).val().length === 8) {

        $.ajax({
            method: "POST",
            url: "/load_user_by_id/member_id",
            data: $(this).serialize()
        }).done(function(res) {
            if (res.first_name) {
                let img_url = "/" + res.img;
                $('.kt-avatar__holder').attr("style", "background-image: url(" + img_url + "); background-position: center; ");
                let fullName = res.last_name + ", " + res.first_name
                if (res.other_names) {
                    fullName = fullName + " " + res.other_names;
                }
                document.querySelector("#full_name").value = fullName;
                let assemblies = {
                    EEA: "Emmanuel English Assembly",
                    GA: "Glory Assembly",
                    HA: "Hope Assembly"
                }
                document.querySelector("#assembly").value = assemblies[res.assembly];
                let contacts = res.contact_1;
                if (res.contact_2) {
                    contacts = contacts + ", " + res.contact_2;
                }
                document.querySelector("#contacts").value = contacts;
        
                if(res.email){
                    document.querySelector("#email").value = res.email;
                }else{
                    document.querySelector("#email").value = "";
                }
            } else {
                let img_url = "/static/assets/media/users/thecopkadna-users.png";
                $('.kt-avatar__holder').attr("style", "background-image: url(" + img_url + "); background-position: center; ");
                document.querySelector("#full_name").value = "";
                document.querySelector("#assembly").value = "";
                document.querySelector("#contacts").value = "";
                document.querySelector("#email").value = "";
            }
        });
    } else {
        let img_url = "/static/assets/media/users/thecopkadna-users.png";
        $('.kt-avatar__holder').attr("style", "background-image: url(" + img_url + "); background-position: center; ")
        document.querySelector("#full_name").value = "";
        document.querySelector("#assembly").value = "";
        document.querySelector("#contacts").value = "";
        document.querySelector("#email").value = "";
    }
});

$("#member_id").on("change", function(e) {
    $("#member_id").trigger("keyup");
});

// print the user's details
let printDetails =  (elementId, memberId) => {
	// get the content to print
	var details = document.querySelector("#" + elementId).innerHTML;
	// open the print window
	var print_area = window.open();
	// compose the document
	print_area.document.write("<html><head><title>Baptism Details</title>"
								+ "<style>.kt-wizard-v2__review-title {font-size: 25; font-weight: bold; margin-top: 20px;} "
								+ ".kt-wizard-v2__review-content {font-size: 20;}"
								+ "</style></head>"
								+ "<body style=\"padding: 20px;\">" 
                                + "<h1 style=\"text-align: center; font-weight: bold;\">COP</h1><br><br>"
                                + "<h1 style=\"text-align: center; font-weight: bold;\">MEMBER ID:&nbsp" + memberId + "</h1>"
								+ details + "</body></html>");
	let cssPaths = ["/static/assets/css/demo2/pages/general/wizard/wizard-2.css",
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