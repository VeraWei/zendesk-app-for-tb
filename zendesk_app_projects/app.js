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
            tasksGet:function  () {
                return {
                    url:'https://app.asana.com/api/1.0/tasks/53847304199068',
                    headers: {
                        "Authorization": "Basic " + btoa('f40sdpFy.GL0PlcZnyssx1V7gjmGbXi8' + ":")
                    },
                    type: 'GET'
                }
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
            projectsGet: function() {
                return {
                    url: 'https://app.asana.com/api/1.0/projects',
                    headers: {
                        "Authorization": "Basic " + btoa('f40sdpFy.GL0PlcZnyssx1V7gjmGbXi8' + ":")
                    },
                    type: 'GET'
                };
            },
            noticePut: function() {
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
                var that = this;
                that.projectsName = data;
                that.taskGroups = _.map(that.projectsName.data,function  (key,value) {
                    return key.name;
                });
                that.$('.taskgroup').autocomplete({
                    source: that.taskGroups
                });
            },
            'projectsGet.fail': function() {
                console.log("projectsget fail");
            },
            'workspaceGet.done': function(data) {
                console.log("Workspace success");
                var that = this;
                that.workspaceName = data;                

                var datas = that.workspaceName.data;
                that.newArray = _.map(datas, _.iteratee('name'));
                that.newId = _.map(datas, _.iteratee('id'));
                that.$('.input-tb-project').autocomplete({
                    source: that.newArray,
                    select:function  (e,ui) {
                        that.workspaceId = that.newId[_.indexOf(that.newArray,ui.item.value)];
                        that.$('.project-field').text(ui.item.value);
                        that.gotoDetails(that);
                    }

                });
            },
            'workspaceGet.fail': function() {
                console.log("workspaceGet fail");
            },
            'tasksGet.done':function  (datas) {
                console.log("tasksGet success");
                this.tasksDatas = datas.data;
                this.initPage();
            },
            'click .btn-large1': 'resetPage',
            'keypress .input-tb-project': function(e) {
                var that = this;
                $self = that.$('.input-tb-project').val();
                if (e.keyCode == 13) {
                    if (_.contains(that.newArray, $self)) {
                        that.gotoDetails(that);
                    } else {
                        services.notify('Workspace didn\'t exist.', 'error');
                    }
                }
            },
            'click .copy-ticket': function(e) {
                e.preventDefault();
                this.$('.description').text(this.ticket().description());
            },
            'click .copy-last-comment': function(e) {
                e.preventDefault();
                this.$('.copy-comment').text(this.ticket().description());
            },
            'click .create_button': function(e) {
                e.preventDefault();
                var that = this;
                var $name = that.$('.reporter');
                var $description = that.$('.description');
                that.projectsDatas = that.projectsName.data;
                var $self = that.$('.taskgroup').val();
                var newArray = _.map(that.projectsDatas, function(value) {
                    return value.name;
                });
                if ($name.val().length === 0) {
                    services.notify('Reporter can\'t be blank.', 'error');
                } else if ($description.val().length === 0) {
                    services.notify('Description can\'t be blank.', 'error');
                } else {
                    that.currentIndex = _.indexOf(newArray, $self);
                    if (_.contains(newArray, $self)) {
                        that.sendFormData();
                    } else {
                        services.notify('Project didn\'t exist.', 'error');
                    }
                }
            },
            'click .cog': function(e) {
                this.switchTo('settings', {
                    header: this.I18n.t('settings_header')
                });

                this.checkThumbs();
            },
            'click .close-admin': function(e) {
                this.switchTo('modal', {
                    header: this.I18n.t('modal_header'),
                    body: this.I18n.t('modal_body')
                });
                this.initPage();
            },
            'click .btn-large3': function(e) {

            },
            'click .summary-setting':function  (e) {
                services.notify('您的设置已保存。');
                var that = this;
                console.log(that.$(e.target).attr('checked',false))
                // if (that.$(e).attr('checked')) {};
                // this.settingDatas.push()
            },
            'click .show-details':function  () {
                console.log(this.$('.admin').length)  
            },
            'hidden .my_modal': 'afterHidden'
        },
        initPage: function() {
            var that = this;
            that.switchTo('modal', {
                taskName: that.tasksDatas.name,
                projectName: that.tasksDatas.projects[0].name,
                assigineeName: that.tasksDatas.assignee.name
            });
            that.$('.modal_button_cell,.linked-task').removeClass('hide');
            that.$('.issues').removeClass('hide');
        },
        gotoDetails:function  (obj) {
            obj.$targetModal = obj.$('.my_modal1');
            obj.$targetModal.find('.control-group.project-selection').addClass('hide');
            obj.$targetModal.find('.wait').removeClass('hide');
            obj.$targetModal.find('.btn-primary').removeAttr("disabled");
            obj.ajax('projectsGet').done(function() {
                obj.$targetModal.removeClass('compact');
                obj.$targetModal.find('.copy-ticket').removeClass('hide');
                obj.$targetModal.find(".new-form").removeClass('hide');
                obj.$targetModal.find('.wait').addClass('hide');
                // obj.workspaceId = obj.newId[_.indexOf(obj.newArray, obj.$self)];
            });
        },
        resetPage: function() {
            this.$(".new-form").addClass('hide');
            this.$(".wait").addClass('hide');
            this.$('.control-group.project-selection').removeClass('hide');
            this.$('.input-tb-project').val('');
            this.$(".my_modal1").addClass('compact');
            this.$('.copy-ticket').addClass('hide');
            this.$('.btn').removeAttr("disabled");
            this.$('.btn.btn-primary').attr("disabled", "disabled");
        },
        doSomething: function() {
            this.ajax('workspaceGet');
            this.ajax('tasksGet');
        },
        sendFormData: function() {
            var that = this;
            var new_task = {
                data: {
                    assignee: "me",
                    name: that.$('.reporter').val(),
                    workspace: that.workspaceId,
                    notes: that.$('.description').val()
                }
            };
            this.ajax('taskPost', new_task);
            this.$targetModal.addClass('compact');
            this.$targetModal.find(".new-form").addClass('hide');
            this.$targetModal.find('.wait').removeClass("hide");
            this.$targetModal.find('.btn').attr("disabled", "disabled");
        },
        checkThumbs:function  () {
            var that = this;
            // that.$('tr').each(function  (e,value) {
            //     console.log(that.$(value).attr('data-id'));
            // });
        },
        afterHidden: function() {}
    };

}());
