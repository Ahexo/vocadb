﻿
module vdb.repositories {
	
	import dc = vdb.dataContracts;

	export class DiscussionRepository {
		
		constructor(private urlMapper: vdb.UrlMapper) { }

		private mapUrl = (relative: string) => {
			return this.urlMapper.mapRelative(UrlMapper.mergeUrls("/api/discussions", relative));
		}

		public createComment = (topicId: number, contract: dc.CommentContract, callback: (contract: dc.CommentContract) => void) => {

			$.post(this.mapUrl("topics/" + topicId + "/comments"), contract, callback, 'json');

		}

		public createTopic = (folderId: number, contract: dc.discussions.DiscussionTopicContract, callback: (contract: dc.discussions.DiscussionTopicContract) => void) => {

			$.post(this.mapUrl("folders/" + folderId + "/topics"), contract, callback, 'json');

		}

		public deleteComment = (commentId: number, callback?: () => void) => {
			
			$.ajax(this.mapUrl("comments/" + commentId), { type: 'DELETE', success: callback });

		}

		public getFolders = (callback: (folders: dc.discussions.DiscussionFolderContract[]) => void) => {
			
			$.getJSON(this.mapUrl("folders"), { fields: 'LastTopicDate,TopicCount' }, callback);

		}

		public getTopic = (topicId: number, callback: (topics: dc.discussions.DiscussionTopicContract) => void) => {

			$.getJSON(this.mapUrl("topics/" + topicId), { fields: 'All' }, callback);

		}

		public getTopics = (folderId: number, callback: (topics: dc.discussions.DiscussionTopicContract[]) => void) => {

			$.getJSON(this.mapUrl("folders/" + folderId + "/topics"), { fields: 'CommentCount,LastCommentDate' }, callback);

		}

		public updateTopic = (topicId: number, contract: dc.discussions.DiscussionTopicContract, callback: () => void) => {

			$.post(this.mapUrl("topics/" + topicId), contract, callback, 'json');

		}

	}

} 