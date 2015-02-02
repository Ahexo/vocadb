﻿
module vdb.viewModels.discussions {
	
	import dc = vdb.dataContracts;
	import rep = vdb.repositories;

	export class DiscussionIndexViewModel {
		
		constructor(private repo: rep.DiscussionRepository,
			private urlMapper: vdb.UrlMapper,
			private canDeleteAllComments: boolean,
			private loggedUserId: number) {
		
			this.newTopic = ko.observable(new DiscussionTopicEditViewModel(loggedUserId));

			this.mapRoute("folders/:folderId?", context => {

				var folderId = parseInt(context.params.folderId);
				this.selectFolderById(folderId);

			});

			this.mapRoute("topics/:topicId?", context => {

				var topicId = parseInt(context.params.topicId);
				this.selectTopicById(topicId);

			});

			this.mapRoute("/", () => {

				this.selectedFolder(null);
				this.selectTopic(null);

			});


			repo.getFolders(folders => {
				this.folders(folders);
				page.start();
			});

			repo.getTopics(result => this.recentTopics(result.items));
				
			this.selectedFolder.subscribe(folder => {

				this.showCreateNewTopic(false);
				this.selectedTopic(null);

				this.loadTopics(folder);

			});

		}

		private canDeleteTopic = (topic: dc.discussions.DiscussionTopicContract) => {
			return (this.canDeleteAllComments || (topic.author && topic.author.id === this.loggedUserId));
		}

		private canEditTopic = (topic: dc.discussions.DiscussionTopicContract) => {
			return (this.canDeleteAllComments || (topic.author && topic.author.id === this.loggedUserId));
		}

		public createNewTopic = () => {
			
			var folder = this.selectedFolder();
			this.repo.createTopic(folder.id, this.newTopic().toContract(), topic => {

				topic.canBeDeleted = false;
				this.newTopic(new DiscussionTopicEditViewModel(this.loggedUserId));
				this.showCreateNewTopic(false);
				this.topics.unshift(topic);
				this.selectTopic(topic);

			});

		}

		public deleteTopic = (topic: dc.discussions.DiscussionTopicContract) => {
			
			this.repo.deleteTopic(topic.id, () => {
				this.selectTopic(null);				
			});

		}

		public folders = ko.observableArray<dc.discussions.DiscussionFolderContract>([]);

		private getFolder = (folderId: number) => {
			return _.find(this.folders(), f => f.id === folderId);
		}

		private loadTopics = (folder: dc.discussions.DiscussionFolderContract, callback?: () => void) => {
		
			if (!folder) {

				this.topics([]);

				if (callback)
					callback();

				return;

			}

			this.repo.getTopicsForFolder(folder.id, topics => {

				this.topics(topics);

				if (callback)
					callback();

			});

		}

		private mapRoute = (partialUrl: string, callback: (context: page.PageContext) => void) => {
			
			page(UrlMapper.mergeUrls("/discussion/", partialUrl), callback);

		}

		public newTopic: KnockoutObservable<DiscussionTopicEditViewModel>;

		public recentTopics = ko.observableArray<dc.discussions.DiscussionTopicContract>([]);

		public selectFolder = (folder: dc.discussions.DiscussionFolderContract) => {
			
			if (!folder) {
				page("/discussion");
			} else {
				page("/discussion/folders/" + folder.id);
			}			
		
		}

		private selectFolderById = (folderId: number) => {
			
			this.selectedFolder(this.getFolder(folderId));

		}

		public selectTopic = (topic: dc.discussions.DiscussionTopicContract) => {
			
			if (!topic) {
				page("/discussion/topics");
			} else {
				page("/discussion/topics/" + topic.id);
			}			

		}

		private selectTopicById = (topicId: number) => {

			if (!topicId) {
				this.loadTopics(this.selectedFolder(),() => this.selectedTopic(null));
				return;
			}

			this.repo.getTopic(topicId, contract => {

				contract.canBeDeleted = this.canDeleteTopic(contract);
				contract.canBeEdited = this.canEditTopic(contract);

				this.selectFolderById(contract.folderId);
				this.selectedTopic(new DiscussionTopicViewModel(this.repo, this.loggedUserId, this.canDeleteAllComments, contract));

			});

		}

		public selectedFolder = ko.observable<dc.discussions.DiscussionFolderContract>(null);

		public selectedTopic = ko.observable<DiscussionTopicViewModel>(null);

		public showCreateNewTopic = ko.observable(false);

		public topics = ko.observableArray<dc.discussions.DiscussionTopicContract>([]);

	}

} 