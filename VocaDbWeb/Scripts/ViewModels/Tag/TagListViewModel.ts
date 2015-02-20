﻿
module vdb.viewModels.tags {
	
	import dc = dataContracts;

	export class TagListViewModel {
		
		private static maxDisplayedTags = 4;

		constructor(tagUsages: dc.tags.TagUsageForApiContract[]) {
			
			this.tagUsages = ko.observableArray(tagUsages);

			if (tagUsages.length <= TagListViewModel.maxDisplayedTags)
				this.expanded(true);

			this.displayedTagUsages = ko.computed(() =>
				(this.expanded() ? this.tagUsages() : _.take(this.tagUsages(), TagListViewModel.maxDisplayedTags))
			);

		}

		public displayedTagUsages: KnockoutComputed<dc.tags.TagUsageForApiContract[]>;

		public getTagUrl = (tagName: string) => {
			return vdb.utils.EntryUrlMapper.details_tag_byName(tagName);
		}

		public expanded = ko.observable(false);

		public tagUsages: KnockoutObservableArray<dc.tags.TagUsageForApiContract>;

	}

} 