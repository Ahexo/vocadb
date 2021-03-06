﻿
module vdb.viewModels.search {

	import cls = vdb.models;
	import dc = vdb.dataContracts;
	import rep = vdb.repositories;

	export class SongSearchViewModel extends SearchCategoryBaseViewModel<ISongSearchItem> {

		constructor(
			searchViewModel: SearchViewModel,
			urlMapper: vdb.UrlMapper,
			lang: string,
			private songRepo: rep.SongRepository,
			private artistRepo: rep.ArtistRepository,
			private userRepo: rep.UserRepository,
			resourceRep: rep.ResourceRepository,
			cultureCode: string,
			private loggedUserId: number,
			sort: string,
			artistId: number[],
			childVoicebanks: boolean,
			songType: string,
			onlyWithPVs: boolean,
			onlyRatedSongs: boolean,
			since: number,
			minScore: number,
			viewMode: string,
			autoplay: boolean,
			shuffle: boolean,
			pvPlayersFactory: pvs.PVPlayersFactory) {

			super(searchViewModel);

			if (searchViewModel) {
				this.resourceManager = searchViewModel.resourcesManager;
				this.showTags = this.searchViewModel.showTags;
			} else {
				this.resourceManager = new cls.ResourcesManager(resourceRep, cultureCode);
				this.resourceManager.loadResources(null, "songSortRuleNames");
				this.showTags = ko.observable(false);
			}

			this.pvServiceIcons = new vdb.models.PVServiceIcons(urlMapper);

			this.artistFilters = new ArtistFilters(this.artistRepo, childVoicebanks);
			this.artistFilters.selectArtists(artistId);

			if (sort)
				this.sort(sort);

			if (songType)
				this.songType(songType);

			if (onlyWithPVs)
				this.pvsOnly(onlyWithPVs);

			if (onlyRatedSongs)
				this.onlyRatedSongs(onlyRatedSongs);

			this.minScore = ko.observable(minScore || undefined).extend({ rateLimit: { timeout: 300, method: "notifyWhenChangesStop" } });;
			this.since = ko.observable(since);
			this.viewMode = ko.observable(viewMode || "Details");

			this.artistFilters.artists.subscribe(this.updateResultsWithTotalCount);
			this.artistFilters.artistParticipationStatus.subscribe(this.updateResultsWithTotalCount);
			this.artistFilters.childVoicebanks.subscribe(this.updateResultsWithTotalCount);
			this.minScore.subscribe(this.updateResultsWithTotalCount);
			this.onlyRatedSongs.subscribe(this.updateResultsWithTotalCount);
			this.pvPlayerViewModel = new pvs.PVPlayerViewModel(urlMapper, songRepo, userRepo, pvPlayersFactory, autoplay, shuffle);
			this.pvsOnly.subscribe(this.updateResultsWithTotalCount);
			this.since.subscribe(this.updateResultsWithTotalCount);
			this.songType.subscribe(this.updateResultsWithTotalCount);
			this.sort.subscribe(this.updateResultsWithTotalCount);
			this.viewMode.subscribe(this.updateResultsWithTotalCount);

			this.sortName = ko.computed(() => this.resourceManager.resources().songSortRuleNames != null ? this.resourceManager.resources().songSortRuleNames[this.sort()] : "");

			var songsRepoAdapter = new vdb.viewModels.songs.PlayListRepositoryForSongsAdapter(songRepo, this.searchTerm, this.sort, this.songType,
				this.tagIds, this.childTags,
				this.artistFilters.artistIds, this.artistFilters.artistParticipationStatus, this.artistFilters.childVoicebanks, this.pvsOnly, this.since,
				this.minScore,
				this.onlyRatedSongs, this.loggedUserId, this.fields, this.draftsOnly);

			this.playListViewModel = new vdb.viewModels.songs.PlayListViewModel(urlMapper, songsRepoAdapter, songRepo, userRepo, this.pvPlayerViewModel,
				cls.globalization.ContentLanguagePreference[lang]);

			this.loadResults = (pagingProperties, searchTerm, tag, childTags, status, callback) => {

				if (this.viewMode() === "PlayList") {
					this.playListViewModel.updateResultsWithTotalCount();		
					callback({ items: [], totalCount: 0 });			
				} else {

					this.songRepo.getList(pagingProperties, lang, searchTerm, this.sort(),
						this.songType() != cls.songs.SongType[cls.songs.SongType.Unspecified] ? this.songType() : null,
						tag,
						childTags,
						this.artistFilters.artistIds(),
						this.artistFilters.artistParticipationStatus(),
						this.artistFilters.childVoicebanks(),
						this.pvsOnly(),
						null,
						this.since(),
						this.minScore(),
						this.onlyRatedSongs() ? this.loggedUserId : null,
						this.fields(),
						status, result => {

							_.each(result.items, (song: ISongSearchItem) => {

								if (song.pvServices && song.pvServices != 'Nothing') {
									song.previewViewModel = new SongWithPreviewViewModel(this.songRepo, this.userRepo, song.id, song.pvServices);
									song.previewViewModel.ratingComplete = vdb.ui.showThankYouForRatingMessage;
								} else {
									song.previewViewModel = null;
								}

							});

							callback(result);

						});

				}

			}

		}

		public artistFilters: ArtistFilters;
		public minScore: KnockoutObservable<number>;
		public onlyRatedSongs = ko.observable(false);
		public playListViewModel: vdb.viewModels.songs.PlayListViewModel;
		public pvPlayerViewModel: pvs.PVPlayerViewModel;
		public pvsOnly = ko.observable(false);
		private pvServiceIcons: vdb.models.PVServiceIcons;
		private resourceManager: cls.ResourcesManager;
		public since: KnockoutObservable<number>;
		public songType = ko.observable("Unspecified");
		public sort = ko.observable("Name");
		public sortName: KnockoutComputed<string>;
		public viewMode: KnockoutObservable<string>;

		public fields = ko.computed(() => this.showTags() ? "AdditionalNames,ThumbUrl,Tags" : "AdditionalNames,ThumbUrl");

		public getPVServiceIcons = (services: string) => {
			return this.pvServiceIcons.getIconUrls(services);
		}

		public showTags: KnockoutObservable<boolean>;

	}

	export interface ISongSearchItem extends dc.SongApiContract {

		previewViewModel?: SongWithPreviewViewModel;

	}

}