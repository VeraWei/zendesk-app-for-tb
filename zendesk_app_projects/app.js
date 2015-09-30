(function() {

    return {
        requests: {
            taskPost: function(new_task_data) {
                return {
                    url: 'https://app.asana.com/api/1.0/tasks',
                    headers: {
                        "Authorization": "Basic " + btoa('f40sdpFy.GL0PlcZnyssx1V7gjmGbXi8' + ":")
                    },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(new_task_data)
                };
            },
            workspaceGet: function() {
                return {
                    url: 'https://app.asana.com/api/1.0/workspaces',
                    headers: {
                        "Authorization": "Basic " + btoa('f40sdpFy.GL0PlcZnyssx1V7gjmGbXi8' + ":")
                    },
                    type: 'GET'
                };
            },
            projectsGet: function  () {
            	return {
            				url: 'https://app.asana.com/api/1.0/projects',
                    headers: {
                        "Authorization": "Basic " + btoa('f40sdpFy.GL0PlcZnyssx1V7gjmGbXi8' + ":")
                    },
                    type: 'GET'
            	};
            },
            noticePut: function  () {
            	return {
            		// url: 'https://teambition.zendesk.com//api/v2/tickets/243/comments.json',
            		// headers:{

            		// },
            		// type: 'PUT'
            	}
            }
        },
        events: {
            'app.activated': 'doSomething',
            'taskPost.done': function() {
            		console.log("taskPostGeet success");
                this.$('.close').trigger('click');
            },
            'taskPost.fail': function() {
                console.log("taskPostGeet fail");
            },
            'projectsGet.done': function(data) {
            		console.log("projectsget success");
            		this.projectsName = data;
            },
            'projectsGet.fail': function() {
            		console.log("projectsget fail");
                console.log("fail");
            },
            'workspaceGet.done': function(data) {
            		console.log("Workspace success");
            		this.initPage();
                this.workspaceName = data;
            },
            'workspaceGet.fail': function() {
                console.log("workspaceGet fail");
            },
            'click .btn-large1': 'resetPage',
            'keypress .input-tb-project': function(e) {
                if (e.keyCode == 13) {
                    var data = this.workspaceName.data;
                    this.$targetModal = this.$('.my_modal1');
                    var $self = this.$('.input-tb-project').val();
                    var newArray = _.map(data,_.iteratee('name'));
                    var newId = _.map(data,_.iteratee('id'));
	                	if(_.contains(newArray,$self)){
	                      this.$targetModal.find('.control-group.project-selection').addClass('hide');
	                			this.$targetModal.find('.wait').removeClass('hide');
                        this.$targetModal.find('.btn-primary').removeAttr("disabled");
		                    this.ajax('projectsGet').done(function  () { 
			                  		this.$targetModal.removeClass('compact');
                            this.$targetModal.find('.copy-ticket').removeClass('hide');
                            this.$targetModal.find(".new-form").removeClass('hide');
                            this.$targetModal.find('.wait').addClass('hide');
                            this.$('.project-field').text($self);
                            this.workspaceId = newId[_.indexOf(newArray,$self)];
		                    });
	                	}else{
	                			services.notify('Workspace didn\'t exist.','error');
	                	}
                }
            },
            'click .copy-ticket': function  (e) {
            	e.preventDefault();
            	this.$('#description').text(this.ticket().description());
            },
            'click .copy-last-comment': function  (e) {
            	e.preventDefault();
            	this.$('.copy-comment').text(this.ticket().description());
            },
            'click .create_button': function(e) {
                e.preventDefault();
                var $name = this.$('#reporter');
                var $description = this.$('#description');
                if ($name.val().length === 0) {
                   services.notify('Reporter can\'t be blank.', 'error');
                }else if ($description.val().length === 0){
                   services.notify('Description can\'t be blank.', 'error');
                }else {
                	var projectsDatas = this.projectsName.data;
                	var $self = this.$('#taskgroup').val();
                	var newArray = _.map(projectsDatas, function(value){
                				return value.name;
                	});
                	this.currentIndex = _.indexOf(newArray,$self);
                	// console.log()
                	if(_.contains(newArray,$self)){
                			this.sendFormData();
                	}else{
                			services.notify('Project didn\'t exist.','error');
                	}
                }
            },
            'click .cog': function(e) {
                this.switchTo('settings', {
                    header: this.I18n.t('settings_header')
                });
            },
            'click .close-admin': function(e) {
                this.switchTo('modal', {
                    header: this.I18n.t('modal_header'),
                    body: this.I18n.t('modal_body')
                });
                this.initPage();
            },
            'click .btn-large3':function  (e) {
            		
            },
            'hidden .my_modal': 'afterHidden'
        },
        initPage: function  () {
          this.$('section>.wait').hide();
          this.$('.modal_button_cell,.linked-task').removeClass('hide');
        },
        resetPage: function  () {
        	this.$(".new-form").addClass('hide');
          this.$(".wait").addClass('hide');
          this.$('.control-group.project-selection').removeClass('hide');
          this.$('.input-tb-project').val('');
          this.$(".my_modal1").addClass('compact');
          this.$('.copy-ticket').addClass('hide');
          this.$('.btn').removeAttr("disabled");
          this.$('.btn.btn-primary').attr("disabled","disabled");
        },
        doSomething: function() {
            this.switchTo('modal', {
                header: this.I18n.t('modal_header'),
                body: this.I18n.t('modal_body')
            });
            this.ajax('workspaceGet');
        },
        sendFormData: function() {
            var new_task = {
                data: {
                    assignee: "me",
                    name: this.$('#reporter').val(),
                    workspace: this.workspaceId,
                    notes: this.$('#remark').val()
                }
            };
            this.ajax('taskPost', new_task);
            this.$targetModal.addClass('compact');
            this.$targetModal.find(".new-form").addClass('hide');
            this.$targetModal.find('.wait').removeClass("hide");
            this.$targetModal.find('.btn').attr("disabled","disabled");
        },
        afterHidden: function() {}
    };

}());
