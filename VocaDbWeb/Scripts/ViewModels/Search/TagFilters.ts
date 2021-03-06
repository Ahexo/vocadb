﻿
module vdb.viewModels.search {
	
	// Manages tag filters for search
	export class TagFilters {

		constructor(
			private tagRepo: repositories.TagRepository,
			private languageSelection: string,
			tags: KnockoutObservableArray<TagFilter> = null) {
			
			this.tags = (tags || ko.observableArray<TagFilter>());
			this.tagIds = ko.computed(() => _.map(this.tags(), t => t.id));

		}

		public addTag = (tag: dc.TagBaseContract) => this.tags.push(new TagFilter(tag.id, tag.name, tag.urlSlug));

		public addTags = (
			selectedTagIds: number[],
			tagRepo: rep.TagRepository) => {

			if (!selectedTagIds)
				return;

			var filters = _.map(selectedTagIds, a => new TagFilter(a));
			ko.utils.arrayPushAll(this.tags, filters);

			if (!tagRepo)
				return;

			_.forEach(filters, newTag => {

				var selectedTagId = newTag.id;

				tagRepo.getById(selectedTagId, null, this.languageSelection, tag => {
					newTag.name(tag.name);
					newTag.urlSlug(tag.urlSlug);
				});

			});

		};

		public tags: KnockoutObservableArray<TagFilter>;
		public tagIds: KnockoutComputed<number[]>;

	}

}