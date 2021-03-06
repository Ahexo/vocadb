﻿
module vdb.viewModels {

	import dc = vdb.dataContracts;

	export class DeletedAlbumsViewModel {

		constructor(private albumRepo: repositories.AlbumRepository) {
			this.updateResults(true);
			this.paging.page.subscribe(() => this.updateResults(false));
			this.paging.pageSize.subscribe(() => this.updateResults(true));
			this.searchTerm.subscribe(() => this.updateResults(true));
		}

		public discTypeName = (discType: string) => discType;
		public loading = ko.observable(false);
		public page = ko.observableArray<dc.AlbumContract>([]); // Current page of items
		public paging = new ServerSidePagingViewModel(20); // Paging view model
		public ratingStars = () => [];
		public searchTerm = ko.observable("").extend({ rateLimit: { timeout: 300, method: "notifyWhenChangesStop" } });
		public showTags = ko.observable(false);
		public sort = ko.observable("Name");
		public viewMode = ko.observable("Details");

		private updateResults = (clearResults: boolean) => {

			if (clearResults) {
				this.paging.page(1);
			}

			var pagingProperties = this.paging.getPagingProperties(clearResults);
			this.albumRepo.getList(pagingProperties, this.albumRepo.languagePreferenceStr, this.searchTerm(), "Name", undefined, null,
				null, null, undefined, undefined, "AdditionalNames,MainPicture", null, true, result => {

					this.page(result.items);

					if (pagingProperties.getTotalCount)
						this.paging.totalItems(result.totalCount);

				});
		
		}

	}

} 